"""
Setup script to create Supabase tables via the REST API.
Run this once before using the application.
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def run_sql(sql: str):
    """Execute SQL via Supabase's RPC endpoint."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    resp = httpx.post(url, json={"query": sql}, headers=headers, timeout=30)
    return resp


def create_tables_via_rest():
    """Create tables by inserting a test record — if the table doesn't exist, use raw SQL."""
    print("🔧 Setting up Supabase database tables...")
    print(f"📡 Supabase URL: {SUPABASE_URL}")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    # Test if grievances table exists by trying to read from it
    test_url = f"{SUPABASE_URL}/rest/v1/grievances?select=id&limit=1"
    resp = httpx.get(test_url, headers=headers, timeout=10)

    if resp.status_code == 200:
        print("✅ Tables already exist! Database is ready.")
        return True
    elif resp.status_code == 404 or "relation" in resp.text.lower():
        print("❌ Tables do not exist yet.")
        print("")
        print("=" * 60)
        print("⚠️  ACTION REQUIRED: Create tables in Supabase SQL Editor")
        print("=" * 60)
        print("")
        print("1. Go to: https://supabase.com/dashboard")
        print("2. Open your project")
        print("3. Go to SQL Editor")
        print("4. Copy & paste the contents of 'schema.sql'")
        print("5. Click 'Run'")
        print("")
        print("The schema.sql file is located at:")
        print(f"   e:\\hackathon-cosmi\\backend\\schema.sql")
        print("")
        print("After running the SQL, restart the backend server.")
        return False
    else:
        print(f"⚠️  Unexpected response ({resp.status_code}): {resp.text[:200]}")
        return False


if __name__ == "__main__":
    create_tables_via_rest()
