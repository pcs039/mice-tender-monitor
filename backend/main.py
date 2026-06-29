import os
import httpx
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from dotenv import load_dotenv

# Load env variables from root
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

app = FastAPI(title="MICE Tender Dashboard API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request bodies
class TenderUpdate(BaseModel):
    user_status: Optional[str] = Field(None, description="Internal status: '검토대기', '지원검토', '제출준비', '제출완료', '제외'")
    assignee: Optional[str] = Field(None, description="Assigned staff name")
    memo: Optional[str] = Field(None, description="Memo content")
    event_start_date: Optional[datetime] = Field(None, description="MICE event start date")
    event_end_date: Optional[datetime] = Field(None, description="MICE event end date")
    event_location: Optional[str] = Field(None, description="MICE event venue/region")

# Endpoints
@app.get("/api/tenders")
@app.get("/tenders")
async def get_tenders(
    sort: str = Query("latest", description="Sort order: 'latest', 'budget', 'deadline'"),
    search: Optional[str] = Query(None, description="Search term in title or organization"),
    category: Optional[str] = Query(None, description="Category filter (e.g. '국제회의', '컨퍼런스')"),
    status: Optional[str] = Query(None, description="Announced status (e.g. '입찰진행중', '마감', '취소')"),
    user_status: Optional[str] = Query(None, description="Internal user tracking status")
):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase environment variables are missing!")
        
    url = f"{SUPABASE_URL}/rest/v1/tenders"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    # Build PostgREST parameters
    params = {}
    
    if category:
        params["category"] = f"eq.{category}"
    if status:
        params["status"] = f"eq.{status}"
    if user_status:
        params["user_status"] = f"eq.{user_status}"
    if search:
        # PostgREST OR filter: or=(title.ilike.*search*,org_name.ilike.*search*)
        params["or"] = f"(title.ilike.*{search}*,org_name.ilike.*{search}*,const_org_name.ilike.*{search}*)"
        
    # Sorting
    if sort == "budget":
        params["order"] = "budget.desc.nullslast"
    elif sort == "deadline":
        params["order"] = "bid_end_date.asc.nullslast"
    else: # latest
        params["order"] = "bid_start_date.desc.nullslast"
        
    params["limit"] = 200
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=headers, params=params)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"Supabase REST error: {res.text}")
            return res.json()
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database REST error: {str(e)}")

@app.get("/api/tenders/{tender_id}")
@app.get("/tenders/{tender_id}")
async def get_tender_detail(tender_id: str):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase environment variables are missing!")
        
    url = f"{SUPABASE_URL}/rest/v1/tenders"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    params = {
        "or": f"(id.eq.{tender_id},bid_notice_no.eq.{tender_id})",
        "limit": 1
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=headers, params=params)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"Supabase REST error: {res.text}")
            data = res.json()
            if not data:
                raise HTTPException(status_code=404, detail="Tender not found")
            return data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database REST error: {str(e)}")

@app.put("/api/tenders/{tender_id}")
@app.put("/tenders/{tender_id}")
async def update_tender(tender_id: str, update_data: TenderUpdate):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase environment variables are missing!")
        
    # First find the actual UUID of the tender
    tender = await get_tender_detail(tender_id)
    tender_uuid = tender["id"]
    
    url = f"{SUPABASE_URL}/rest/v1/tenders"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    params = {
        "id": f"eq.{tender_uuid}"
    }
    
    payload = update_data.model_dump(exclude_unset=True)
    # Convert datetimes to ISO strings
    for k, v in payload.items():
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
            
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.patch(url, headers=headers, params=params, json=payload)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"Supabase patch error: {res.text}")
            data = res.json()
            if not data:
                raise HTTPException(status_code=404, detail="Tender not found after patch")
            return data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update tender: {str(e)}")

@app.post("/api/tenders/sync")
@app.post("/tenders/sync")
async def trigger_sync():
    # Import inside endpoint to avoid circular imports and run on demand
    from backend.collector import sync_data
    try:
        result = await sync_data()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync execution failed: {str(e)}")

@app.get("/api/stats")
@app.get("/stats")
async def get_stats():
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase environment variables are missing!")
        
    url = f"{SUPABASE_URL}/rest/v1/tenders"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    
    params = {
        "select": "status,budget,user_status"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=headers, params=params)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"Supabase stats error: {res.text}")
                
            data = res.json()
            
            total_count = len(data)
            pending_count = 0
            reviewing_count = 0
            preparing_count = 0
            submitted_count = 0
            excluded_count = 0
            active_budget_sum = 0
            
            for item in data:
                u_status = item.get("user_status")
                status = item.get("status")
                budget = item.get("budget") or 0
                
                if u_status == "검토대기":
                    pending_count += 1
                elif u_status == "지원검토":
                    reviewing_count += 1
                elif u_status == "제출준비":
                    preparing_count += 1
                elif u_status == "제출완료":
                    submitted_count += 1
                elif u_status == "제외":
                    excluded_count += 1
                    
                if status == "입찰진행중":
                    active_budget_sum += budget
                    
            return {
                "total_count": total_count,
                "pending_count": pending_count,
                "reviewing_count": reviewing_count,
                "preparing_count": preparing_count,
                "submitted_count": submitted_count,
                "excluded_count": excluded_count,
                "active_budget_sum": active_budget_sum
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Start web server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
