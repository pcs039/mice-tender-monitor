import os
import sys
import asyncio
import asyncpg
from dotenv import load_dotenv

async def main():
    # Load env from parent directory (workspace root)
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(parent_dir, '.env')
    load_dotenv(dotenv_path=env_path)

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema.sql')
    if not os.path.exists(schema_path):
        print(f"Error: schema.sql not found at {schema_path}", file=sys.stderr)
        sys.exit(1)

    print("Connecting to database...")
    try:
        conn = await asyncpg.connect(db_url)
        
        print(f"Reading {schema_path}...")
        with open(schema_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
        print("Executing schema SQL...")
        # conn.execute runs multiple commands separated by semicolons
        await conn.execute(sql)
        print("Database schema applied successfully!")
        
        await conn.close()
    except Exception as e:
        print(f"Failed to apply database schema: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
