import os
import asyncpg
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from dotenv import load_dotenv

# Load env variables from root
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="MICE Tender Dashboard API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific Vercel domains or local port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup database connection pool
@app.on_event("startup")
async def startup():
    if DATABASE_URL:
        try:
            print("Initializing database connection pool on startup...")
            app.state.pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=1,
                max_size=5,
                max_inactive_connection_lifetime=300.0,
                statement_cache_size=0
            )
            print("Database pool initialized successfully!")
        except Exception as e:
            print(f"Startup connection pool initialization bypassed: {e}")

# Shutdown pool
@app.on_event("shutdown")
async def shutdown():
    if hasattr(app.state, "pool") and app.state.pool is not None:
        print("Closing database connection pool...")
        await app.state.pool.close()
        print("Database pool closed.")

import asyncio
db_pool_lock = asyncio.Lock()

# Dependency to get connection from pool
async def get_db_conn(request: Request):
    if not hasattr(request.app.state, "pool") or request.app.state.pool is None:
        async with db_pool_lock:
            if not hasattr(request.app.state, "pool") or request.app.state.pool is None:
                db_url = os.getenv("DATABASE_URL")
                if not db_url:
                    raise ValueError("DATABASE_URL environment variable is missing!")
                print("Lazily creating database connection pool for Vercel Serverless Function...")
                request.app.state.pool = await asyncpg.create_pool(
                    db_url,
                    min_size=0,
                    max_size=5,
                    max_inactive_connection_lifetime=300.0,
                    statement_cache_size=0
                )
    async with request.app.state.pool.acquire() as conn:
        yield conn


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
async def get_tenders(
    conn = Depends(get_db_conn),
    sort: str = Query("latest", description="Sort order: 'latest', 'budget', 'deadline'"),
    search: Optional[str] = Query(None, description="Search term in title or organization"),
    category: Optional[str] = Query(None, description="Category filter (e.g. '국제회의', '컨퍼런스')"),
    status: Optional[str] = Query(None, description="Announced status (e.g. '입찰진행중', '마감', '취소')"),
    user_status: Optional[str] = Query(None, description="Internal user tracking status")
):
    query = "SELECT * FROM public.tenders WHERE 1=1"
    params = []
    param_idx = 1
    
    if search:
        query += f" AND (title ILIKE ${param_idx} OR org_name ILIKE ${param_idx} OR const_org_name ILIKE ${param_idx})"
        params.append(f"%{search}%")
        param_idx += 1
        
    if category:
        query += f" AND category = ${param_idx}"
        params.append(category)
        param_idx += 1
        
    if status:
        query += f" AND status = ${param_idx}"
        params.append(status)
        param_idx += 1
        
    if user_status:
        query += f" AND user_status = ${param_idx}"
        params.append(user_status)
        param_idx += 1
        
    # Apply sorting
    if sort == "budget":
        query += " ORDER BY budget DESC, created_at DESC"
    elif sort == "deadline":
        # Keep null dates or closed bids at the end, show active soonest first
        query += " ORDER BY CASE WHEN bid_end_date IS NULL THEN 1 ELSE 0 END, bid_end_date ASC, created_at DESC"
    elif sort == "latest":
        query += " ORDER BY bid_start_date DESC, created_at DESC"
    else:
        query += " ORDER BY created_at DESC"
        
    query += " LIMIT 200"
    
    try:
        rows = await conn.fetch(query, *params)
        # Convert records to dictionary, datetime automatically handled by FastAPI
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

@app.get("/api/tenders/{tender_id}")
async def get_tender_detail(tender_id: str, conn = Depends(get_db_conn)):
    query = "SELECT * FROM public.tenders WHERE id = $1"
    try:
        row = await conn.fetchrow(query, tender_id)
        if not row:
            raise HTTPException(status_code=404, detail="Tender not found")
        return dict(row)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/api/tenders/{tender_id}")
async def update_tender(
    tender_id: str,
    update_data: TenderUpdate,
    conn = Depends(get_db_conn)
):
    # Check if tender exists
    exist_check = await conn.fetchval("SELECT id FROM public.tenders WHERE id = $1", tender_id)
    if not exist_check:
        # Check if they passed UUID or bid_notice_no
        exist_check = await conn.fetchval("SELECT id FROM public.tenders WHERE bid_notice_no = $1", tender_id)
        if not exist_check:
            raise HTTPException(status_code=404, detail="Tender not found")
        tender_uuid = exist_check
    else:
        tender_uuid = exist_check
        
    # Build dynamic update statement
    fields = []
    params = []
    idx = 1
    
    update_dict = update_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields provided to update")
        
    for k, v in update_dict.items():
        # Validate user_status values if specified
        if k == "user_status" and v not in ['검토대기', '지원검토', '제출준비', '제출완료', '제외']:
            raise HTTPException(status_code=400, detail=f"Invalid user_status: {v}")
        fields.append(f"{k} = ${idx}")
        params.append(v)
        idx += 1
        
    params.append(tender_uuid)
    query = f"UPDATE public.tenders SET {', '.join(fields)} WHERE id = ${idx} RETURNING *"
    
    try:
        updated_row = await conn.fetchrow(query, *params)
        return dict(updated_row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update tender: {str(e)}")

@app.post("/api/tenders/sync")
async def trigger_sync():
    # Import inside endpoint to avoid circular imports and run on demand
    from backend.collector import sync_data
    try:
        result = await sync_data()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync execution failed: {str(e)}")

@app.get("/api/stats")
async def get_stats(conn = Depends(get_db_conn)):
    # Calculate key metrics for the MICE dashboard
    query = """
        SELECT 
            COUNT(*) as total_count,
            COALESCE(SUM(CASE WHEN user_status = '검토대기' THEN 1 ELSE 0 END), 0) as pending_count,
            COALESCE(SUM(CASE WHEN user_status = '지원검토' THEN 1 ELSE 0 END), 0) as reviewing_count,
            COALESCE(SUM(CASE WHEN user_status = '제출준비' THEN 1 ELSE 0 END), 0) as preparing_count,
            COALESCE(SUM(CASE WHEN user_status = '제출완료' THEN 1 ELSE 0 END), 0) as submitted_count,
            COALESCE(SUM(CASE WHEN user_status = '제외' THEN 1 ELSE 0 END), 0) as excluded_count,
            COALESCE(SUM(CASE WHEN status = '입찰진행중' THEN budget ELSE 0 END), 0) as active_budget_sum
        FROM public.tenders;
    """
    try:
        row = await conn.fetchrow(query)
        return dict(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Start web server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
