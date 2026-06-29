import os
import httpx
import asyncio
import asyncpg
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path=env_path)

DB_URL = os.getenv("DATABASE_URL")
if DB_URL and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)
OPEN_API_KEY = os.getenv("OPEN_API_KEY")

# MICE Keywords to monitor
KEYWORDS = ['국제회의', '세미나', '컨퍼런스', '콘퍼런스', '포럼', 'MICE', '운영대행', '전시']

# Save tenders to Supabase
async def save_tenders_to_db(tenders):
    if not DB_URL:
        print("Database connection URL missing. Cannot save.")
        return 0
        
    conn = await asyncpg.connect(DB_URL, statement_cache_size=0)
    inserted_count = 0
    
    try:
        for t in tenders:
            # We use ON CONFLICT to upsert, keeping manual event info updates intact
            query = """
                INSERT INTO public.tenders (
                    bid_notice_no, bid_notice_ord, title, org_name, const_org_name,
                    bid_start_date, bid_end_date, budget, link, category, status,
                    event_start_date, event_end_date, event_location, memo
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (bid_notice_no) DO UPDATE SET
                    bid_notice_ord = EXCLUDED.bid_notice_ord,
                    title = EXCLUDED.title,
                    org_name = EXCLUDED.org_name,
                    const_org_name = EXCLUDED.const_org_name,
                    bid_start_date = EXCLUDED.bid_start_date,
                    bid_end_date = EXCLUDED.bid_end_date,
                    budget = EXCLUDED.budget,
                    link = EXCLUDED.link,
                    category = EXCLUDED.category,
                    status = EXCLUDED.status,
                    event_start_date = COALESCE(tenders.event_start_date, EXCLUDED.event_start_date),
                    event_end_date = COALESCE(tenders.event_end_date, EXCLUDED.event_end_date),
                    event_location = COALESCE(tenders.event_location, EXCLUDED.event_location),
                    memo = COALESCE(tenders.memo, EXCLUDED.memo)
                RETURNING id;
            """
            await conn.execute(
                query,
                t["bid_notice_no"],
                t["bid_notice_ord"],
                t["title"],
                t.get("org_name"),
                t.get("const_org_name"),
                t.get("bid_start_date"),
                t.get("bid_end_date"),
                t.get("budget"),
                t.get("link"),
                t.get("category"),
                t.get("status", "입찰진행중"),
                t.get("event_start_date"),
                t.get("event_end_date"),
                t.get("event_location"),
                t.get("memo")
            )
            inserted_count += 1
        print(f"Successfully upserted {inserted_count} tenders to database.")
    except Exception as e:
        print(f"Error saving to DB: {e}")
    finally:
        await conn.close()
        
    return inserted_count

# Parse date strings from OpenAPI
def parse_api_date(date_str):
    if not date_str:
        return None
    try:
        # Expected format: "2026-06-29 14:00:00" or similar
        return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            # Try parsing YYYYMMDDHHMM
            return datetime.strptime(date_str, "%Y%m%d%H%M")
        except ValueError:
            return None

# Fetch from 나라장터 OpenAPI
async def fetch_from_api(keyword: str):
    # Verified endpoint URL for 나라장터 용역 입찰공고 서비스
    url = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc"
    
    # Query for the last 7 days of announcements
    today = datetime.now()
    start_date = today - timedelta(days=7)
    
    params = {
        "serviceKey": OPEN_API_KEY,
        "numOfRows": 50,
        "pageNo": 1,
        "inqryDiv": 1, # 공고등록일 기준
        "inqryBgnDt": start_date.strftime("%Y%m%d0000"),
        "inqryEndDt": today.strftime("%Y%m%d2359"),
        "bidNtceNm": keyword,
        "type": "json"
    }
    
    print(f"Calling OpenAPI for keyword: '{keyword}'...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                print(f"API HTTP Error {response.status_code} for keyword {keyword}")
                return None
                
            data = response.json()
            # Check for API error response structure
            if "response" not in data or "body" not in data["response"]:
                header = data.get("response", {}).get("header", {})
                result_code = header.get("resultCode", "UNKNOWN")
                result_msg = header.get("resultMsg", "Unknown error")
                print(f"API business error: {result_code} - {result_msg}")
                return None
                
            body = data["response"]["body"]
            items = body.get("items", [])
            if not items or isinstance(items, str):
                print(f"No results for keyword '{keyword}'")
                return []
                
            # Defensive check for list structure (in this version items is directly a list of items)
            if isinstance(items, dict) and "item" in items:
                item_list = items["item"]
            else:
                item_list = items
                
            if isinstance(item_list, dict):
                item_list = [item_list]
                
            parsed_tenders = []
            for item in item_list:
                title = item.get("bidNtceNm", "")
                
                # Check for cancellation notices
                status = "입찰진행중"
                ntce_div = item.get("ntceKindNm", "")
                if "취소" in ntce_div or "취소" in item.get("bidNtceNm", ""):
                    status = "취소"
                elif parse_api_date(item.get("bidClseDt")) and datetime.now() > parse_api_date(item.get("bidClseDt")):
                    status = "마감"
                
                # Use asignBdgtAmt (assigned budget) as primary, falling back to bdgtAmt/presmptPrce
                budget_str = item.get("asignBdgtAmt") or item.get("bdgtAmt") or item.get("presmptPrce") or "0"
                try:
                    budget = int(float(budget_str))
                except ValueError:
                    budget = 0
                
                # Use bidNtceDtlUrl or fallback to bidNtceUrl
                link = item.get("bidNtceDtlUrl") or item.get("bidNtceUrl")
                
                parsed_tenders.append({
                    "bid_notice_no": item.get("bidNtceNo"),
                    "bid_notice_ord": item.get("bidNtceOrd", "000"),
                    "title": title,
                    "org_name": item.get("dminsttNm") or item.get("ntceInsttNm"),
                    "const_org_name": item.get("ntceInsttNm"),
                    "bid_start_date": parse_api_date(item.get("bidBeginDt") or item.get("bidNtceDt")),
                    "bid_end_date": parse_api_date(item.get("bidClseDt")),
                    "budget": budget,
                    "link": link,
                    "category": keyword,
                    "status": status,
                    "event_start_date": None,
                    "event_end_date": None,
                    "event_location": None,
                    "memo": None
                })
            
            print(f"Fetched {len(parsed_tenders)} tenders for keyword '{keyword}'")
            return parsed_tenders
            
    except Exception as e:
        print(f"Exception during API fetch for keyword {keyword}: {e}")
        return None

# Main sync process
async def sync_data():
    print("Starting sync process...")
    
    if not OPEN_API_KEY:
        raise ValueError("OPEN_API_KEY environment variable is missing!")
        
    all_tenders = []
    
    for kw in KEYWORDS:
        tenders = await fetch_from_api(kw)
        if tenders is not None:
            all_tenders.extend(tenders)
        else:
            print(f"API fetch failed for keyword: {kw}")
            
    # Remove duplicates from different keywords
    unique_tenders = {}
    for t in all_tenders:
        notice_id = t["bid_notice_no"]
        if notice_id not in unique_tenders:
            unique_tenders[notice_id] = t
        else:
            existing = unique_tenders[notice_id]
            if t["category"] not in existing["category"]:
                existing["category"] = f"{existing['category']},{t['category']}"
                
    inserted = await save_tenders_to_db(list(unique_tenders.values()))
    return {"status": "success", "mode": "api", "count": inserted}

if __name__ == "__main__":
    asyncio.run(sync_data())
