import warnings
warnings.filterwarnings("ignore")
import httpx, json, sqlite3

# Find all grievances
conn = sqlite3.connect("grievance.db")
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT id, tracking_id, status FROM grievances").fetchall()
print("Grievances in DB:")
for r in rows:
    print(f"  id={r['id']}, tracking={r['tracking_id']}, status={r['status']}")
conn.close()

# Resolve ALL grievances so we can test rating
for r in rows:
    gid = r['id']
    print(f"\nResolving {r['tracking_id']}...")
    resp = httpx.patch(f"http://localhost:8000/api/grievances/{gid}/resolve",
                       json={"resolution_notes": "Issue has been fixed"}, timeout=10)
    print(f"  Status: {resp.status_code} - {resp.text[:100]}")

    # Now test rating
    print(f"Testing rate for {r['tracking_id']}...")
    resp2 = httpx.post(f"http://localhost:8000/api/grievances/{gid}/rate",
                       json={"rating": 4}, timeout=10)
    print(f"  Status: {resp2.status_code} - {resp2.text[:200]}")
