import os
import httpx
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
OPEN_API_KEY = os.getenv("OPEN_API_KEY")

# MICE Keywords to monitor (as specified by user)
KEYWORDS = ['국제회의', '세미나', '컨퍼런스', '콘퍼런스', '포럼', 'MICE', '마이스', '운영대행', '회의']

# Keywords to explicitly exclude (IT system integration, equipment purchases, video conferencing builds, etc.)
EXCLUDE_KEYWORDS = [
    "전시", "시스템 구축", "시스템구축", "영상회의", "화상회의", 
    "장비 구매", "장비구매", "장비 도입", "장비도입", "하드웨어", 
    "서버 구축", "서버구축", "네트워크 구축", "네트워크구축", "인프라 구축", "인프라구축"
]

# Save tenders to Supabase using HTTP REST API
async def save_tenders_to_db(tenders):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("Supabase credentials missing. Cannot save.")
        return 0
        
    url = f"{SUPABASE_URL}/rest/v1/tenders"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    # 1. Fetch existing manual entries (event dates, venue, notes, assignee, status) to preserve them
    existing_map = {}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                url, 
                headers=headers, 
                params={"select": "bid_notice_no,event_start_date,event_end_date,event_location,memo,user_status,assignee"}
            )
            if res.status_code == 200:
                for item in res.json():
                    no = item.get("bid_notice_no")
                    if no:
                        existing_map[no] = item
    except Exception as e:
        print(f"Warning: Could not fetch existing tenders to merge manual entries: {e}")
        
    # 2. Merge OpenAPI tenders with existing manual entries
    payload = []
    for t in tenders:
        no = t["bid_notice_no"]
        existing = existing_map.get(no, {})
        
        # Preserve manual entries (COALESCE logic in Python)
        t["event_start_date"] = existing.get("event_start_date") or t.get("event_start_date")
        t["event_end_date"] = existing.get("event_end_date") or t.get("event_end_date")
        t["event_location"] = existing.get("event_location") or t.get("event_location")
        t["memo"] = existing.get("memo") or t.get("memo")
        t["user_status"] = existing.get("user_status") or t.get("user_status") or "검토대기"
        t["assignee"] = existing.get("assignee") or t.get("assignee")
        
        # Convert any datetime objects to ISO strings
        for k in ["bid_start_date", "bid_end_date", "event_start_date", "event_end_date"]:
            if isinstance(t.get(k), datetime):
                t[k] = t[k].isoformat()
                
        payload.append(t)
        
    # 3. PostgREST Bulk UPSERT using resolution=merge-duplicates
    upsert_headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    params = {
        "on_conflict": "bid_notice_no"
    }
    
    inserted_count = 0
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, headers=upsert_headers, params=params, json=payload)
            if res.status_code in [200, 201]:
                inserted_count = len(payload)
                print(f"Successfully upserted {inserted_count} tenders to Supabase via REST API.")
            else:
                print(f"Error upserting to Supabase: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Exception during Supabase REST upsert: {e}")
        
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

# Fetch from 나라장터 OpenAPI and filter locally
async def fetch_and_filter_tenders():
    url = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc"
    
    today = datetime.now()
    start_date = today - timedelta(days=20) # Search last 20 days
    
    params = {
        "serviceKey": OPEN_API_KEY,
        "numOfRows": 900,  # Fetch in bulk
        "pageNo": 1,
        "inqryDiv": 1,     # By registration date
        "inqryBgnDt": start_date.strftime("%Y%m%d0000"),
        "inqryEndDt": today.strftime("%Y%m%d2359"),
        "type": "json"
    }
    
    print("Calling Nara Jangter OpenAPI in bulk...")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                print(f"API HTTP Error {response.status_code}")
                return []
                
            data = response.json()
            if "response" not in data or "body" not in data["response"]:
                header = data.get("response", {}).get("header", {})
                print(f"API business error: {header.get('resultCode')} - {header.get('resultMsg')}")
                return []
                
            body = data["response"]["body"]
            items = body.get("items", [])
            if not items or isinstance(items, str):
                print("No items returned from API.")
                return []
                
            # Defensive check for list structure
            if isinstance(items, dict) and "item" in items:
                item_list = items["item"]
            else:
                item_list = items
                
            if isinstance(item_list, dict):
                item_list = [item_list]
                
            unique_tenders = {}
            for item in item_list:
                title = item.get("bidNtceNm", "")
                notice_no = item.get("bidNtceNo")
                if not title or not notice_no:
                    continue
                    
                # Explicitly exclude undesired keywords in title (SI, IT hardware, system construction, etc.)
                if any(ek in title for ek in EXCLUDE_KEYWORDS):
                    continue
                    
                # Match title against our MICE keywords (case-insensitive)
                matched_kws = []
                for kw in KEYWORDS:
                    if kw.lower() in title.lower() or (kw == "MICE" and "마이스" in title):
                        matched_kws.append(kw)
                        
                if not matched_kws:
                    continue  # Skip if title doesn't match any keyword
                    
                # Check for duplicate in the current batch payload
                if notice_no in unique_tenders:
                    existing = unique_tenders[notice_no]
                    # Combine categories
                    combined_kws = set(existing["category"].split(",") + matched_kws)
                    existing["category"] = ",".join(combined_kws)
                    continue
                
                # Check status
                status = "입찰진행중"
                ntce_div = item.get("ntceKindNm", "")
                if "취소" in ntce_div or "취소" in title:
                    status = "취소"
                elif parse_api_date(item.get("bidClseDt")) and datetime.now() > parse_api_date(item.get("bidClseDt")):
                    status = "마감"
                    
                budget_str = item.get("asignBdgtAmt") or item.get("bdgtAmt") or item.get("presmptPrce") or "0"
                try:
                    budget = int(float(budget_str))
                except ValueError:
                    budget = 0
                    
                link = item.get("bidNtceDtlUrl") or item.get("bidNtceUrl")
                
                unique_tenders[notice_no] = {
                    "bid_notice_no": notice_no,
                    "bid_notice_ord": item.get("bidNtceOrd", "000"),
                    "title": title,
                    "org_name": item.get("dminsttNm") or item.get("ntceInsttNm"),
                    "const_org_name": item.get("ntceInsttNm"),
                    "bid_start_date": parse_api_date(item.get("bidBeginDt") or item.get("bidNtceDt")),
                    "bid_end_date": parse_api_date(item.get("bidClseDt")),
                    "budget": budget,
                    "link": link,
                    "category": ",".join(matched_kws),
                    "status": status,
                    "event_start_date": None,
                    "event_end_date": None,
                    "event_location": None,
                    "memo": None
                }
                
            parsed_tenders = list(unique_tenders.values())
            print(f"Successfully matched and parsed {len(parsed_tenders)} unique MICE tenders.")
            return parsed_tenders
            
    except Exception as e:
        print(f"Exception during bulk API fetch: {e}")
        return []

# Main sync process
async def sync_data():
    print("Starting sync process...")
    
    if not OPEN_API_KEY:
        raise ValueError("OPEN_API_KEY environment variable is missing!")
        
    tenders = await fetch_and_filter_tenders()
    if not tenders:
        print("No MICE tenders fetched.")
        return {"status": "success", "mode": "api", "count": 0}
        
    inserted = await save_tenders_to_db(tenders)
    return {"status": "success", "mode": "api", "count": inserted}

if __name__ == "__main__":
    asyncio.run(sync_data())
