import os
import sys
import asyncio
import asyncpg
from dotenv import load_dotenv

# Load env from workspace root
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path=env_path)

async def test_conn():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL is not set.")
        return False
        
    print(f"Trying direct connection to: {db_url.split('@')[-1]}")
    try:
        conn = await asyncio.wait_for(asyncpg.connect(db_url), timeout=5.0)
        print("Direct connection successful!")
        await conn.close()
        return True
    except Exception as e:
        print(f"Direct connection failed: {e}")
        
        # Let's construct the pooler connection string
        # DSN format: postgresql://[user]:[password]@[host]:[port]/[db]
        if "db." in db_url and ".supabase.co" in db_url:
            parts = db_url.split("://")
            credentials, rest = parts[1].split("@")
            user, password = credentials.split(":")
            host_port, db = rest.split("/")
            host, port = host_port.split(":")
            
            project_ref = host.split(".")[1]
            poolers = [
                "aws-0-ap-northeast-2.pooler.supabase.com",
                "aws-1-ap-northeast-2.pooler.supabase.com",
            ]
            
            for pooler_host in poolers:
                pooler_user = f"postgres.{project_ref}"
                pooler_port = "6543"
                pooler_url = f"postgresql://{pooler_user}:{password}@{pooler_host}:{pooler_port}/{db}"
                
                print(f"\nAttempting pooler connection via {pooler_host}...")
                try:
                    conn = await asyncio.wait_for(asyncpg.connect(pooler_url), timeout=5.0)
                    print(f"Success connecting via pooler: {pooler_host}!")
                    await conn.close()
                    return pooler_url
                except Exception as ex:
                    print(f"Failed with {pooler_host}: {ex}")
        else:
            print("Could not parse host for pooler conversion.")
            
    return False

if __name__ == "__main__":
    result = asyncio.run(test_conn())
    if isinstance(result, str):
        print(f"\nRecommended new DATABASE_URL in .env:\n{result}")
        sys.exit(0)
    elif result:
        sys.exit(0)
    else:
        sys.exit(1)
