import os
import asyncio
import asyncpg
from dotenv import load_dotenv

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path=env_path)

DB_URL = os.getenv("DATABASE_URL")

async def test():
    conn = await asyncpg.connect(DB_URL)
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
        print("Running query...")
        row = await conn.fetchrow(query)
        print("Query succeeded!")
        print(dict(row))
    except Exception as e:
        print(f"Query failed: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(test())
