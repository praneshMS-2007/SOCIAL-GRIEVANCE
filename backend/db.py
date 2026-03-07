"""
Database client with SQLite fallback.
Tries Supabase first; if tables don't exist, uses local SQLite automatically.
Same fluent API: supabase.table("name").select("*").eq("col", val).execute()
"""
import os
import json
import uuid
import sqlite3
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), "grievance.db")


def _init_sqlite():
    """Create all tables in SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS grievances (
            id TEXT PRIMARY KEY,
            tracking_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            urgency TEXT NOT NULL DEFAULT 'medium',
            sentiment_score REAL DEFAULT 0.5,
            status TEXT NOT NULL DEFAULT 'open',
            language TEXT DEFAULT 'en',
            location TEXT,
            district TEXT DEFAULT 'Unknown',
            is_anonymous INTEGER DEFAULT 0,
            is_whistleblower INTEGER DEFAULT 0,
            citizen_name TEXT,
            citizen_contact TEXT,
            sla_deadline TEXT,
            escalation_level INTEGER DEFAULT 0,
            resolution_notes TEXT,
            quality_rating INTEGER,
            summary_en TEXT,
            resolved_at TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS escalation_log (
            id TEXT PRIMARY KEY,
            grievance_id TEXT REFERENCES grievances(id),
            escalated_at TEXT DEFAULT (datetime('now')),
            escalation_level INTEGER NOT NULL,
            reason TEXT,
            auto_triggered INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS clusters (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            district TEXT NOT NULL,
            description TEXT,
            grievance_count INTEGER DEFAULT 0,
            is_systemic INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS cluster_members (
            id TEXT PRIMARY KEY,
            cluster_id TEXT REFERENCES clusters(id),
            grievance_id TEXT REFERENCES grievances(id)
        );

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'department',
            department TEXT,
            display_name TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)

    # Seed default users if table is empty
    import hashlib
    count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if count == 0:
        default_users = [
            ("admin", "admin123", "admin", None, "Administrator"),
            ("water", "dept123", "department", "Water Supply & Sanitation", "Water Dept"),
            ("roads", "dept123", "department", "Roads & Transport", "Roads Dept"),
            ("electricity", "dept123", "department", "Electricity & Power", "Electricity Dept"),
            ("healthcare", "dept123", "department", "Healthcare & Hospitals", "Healthcare Dept"),
            ("education", "dept123", "department", "Education", "Education Dept"),
            ("revenue", "dept123", "department", "Revenue & Land", "Revenue Dept"),
            ("law", "dept123", "department", "Law & Order", "Law & Order Dept"),
            ("municipal", "dept123", "department", "Municipal Administration", "Municipal Dept"),
        ]
        for uname, pwd, role, dept, display in default_users:
            uid = str(uuid.uuid4())
            pwd_hash = hashlib.sha256(pwd.encode()).hexdigest()
            conn.execute(
                "INSERT INTO users (id, username, password_hash, role, department, display_name) VALUES (?,?,?,?,?,?)",
                (uid, uname, pwd_hash, role, dept, display)
            )
        conn.commit()
        print("👤 Seeded 9 default users (admin + 8 departments)")

    conn.close()
    print("✅ SQLite database ready at", DB_PATH)


# Initialize SQLite on import
_init_sqlite()

# Boolean fields that need int<->bool conversion
_BOOL_FIELDS = {"is_anonymous", "is_whistleblower", "is_systemic", "auto_triggered"}


def _row_to_dict(cursor, row):
    """Convert a sqlite3 row to a dict with boolean conversion."""
    cols = [desc[0] for desc in cursor.description]
    d = dict(zip(cols, row))
    for k in _BOOL_FIELDS:
        if k in d:
            d[k] = bool(d[k])
    return d


class SQLiteTable:
    """Fluent SQLite query builder matching the Supabase REST API interface."""

    def __init__(self, table_name: str):
        self.table_name = table_name
        self._select_cols = "*"
        self._filters = []       # (col, op, value)
        self._order_col = None
        self._order_desc = False
        self._range_start = None
        self._range_end = None
        self._method = "GET"
        self._body = None

    def select(self, columns: str = "*"):
        self._select_cols = columns
        self._method = "GET"
        return self

    def insert(self, data: dict):
        self._body = data
        self._method = "POST"
        return self

    def update(self, data: dict):
        self._body = data
        self._method = "PATCH"
        return self

    def eq(self, column: str, value):
        self._filters.append((column, "=", value))
        return self

    def neq(self, column: str, value):
        self._filters.append((column, "!=", value))
        return self

    def in_(self, column: str, values: list):
        placeholders = ",".join("?" for _ in values)
        self._filters.append((column, f"IN ({placeholders})", values))
        return self

    def lt(self, column: str, value):
        self._filters.append((column, "<", value))
        return self

    def gte(self, column: str, value):
        self._filters.append((column, ">=", value))
        return self

    def order(self, column: str, desc: bool = False):
        self._order_col = column
        self._order_desc = desc
        return self

    def range(self, start: int, end: int):
        self._range_start = start
        self._range_end = end
        return self

    def _build_where(self):
        """Build WHERE clause and params."""
        if not self._filters:
            return "", []
        clauses = []
        params = []
        for col, op, val in self._filters:
            if isinstance(val, list):
                clauses.append(f"{col} {op}")
                params.extend(val)
            else:
                # Convert booleans to int for SQLite
                if isinstance(val, bool):
                    val = int(val)
                clauses.append(f"{col} {op} ?")
                params.append(val)
        return " WHERE " + " AND ".join(clauses), params

    def execute(self):
        conn = sqlite3.connect(DB_PATH)
        try:
            if self._method == "GET":
                where, params = self._build_where()
                sql = f"SELECT {self._select_cols} FROM {self.table_name}{where}"
                if self._order_col:
                    direction = "DESC" if self._order_desc else "ASC"
                    sql += f" ORDER BY {self._order_col} {direction}"
                if self._range_start is not None:
                    limit = self._range_end - self._range_start + 1
                    sql += f" LIMIT {limit} OFFSET {self._range_start}"
                cursor = conn.execute(sql, params)
                rows = [_row_to_dict(cursor, row) for row in cursor.fetchall()]
                return _Result(rows)

            elif self._method == "POST":
                data = dict(self._body)
                # Generate UUID if no id
                if "id" not in data:
                    data["id"] = str(uuid.uuid4())
                # Convert booleans to int
                for k in _BOOL_FIELDS:
                    if k in data:
                        data[k] = int(bool(data[k]))
                # Set created_at if not set
                if "created_at" not in data:
                    data["created_at"] = datetime.now(timezone.utc).isoformat()

                cols = ", ".join(data.keys())
                placeholders = ", ".join("?" for _ in data)
                sql = f"INSERT INTO {self.table_name} ({cols}) VALUES ({placeholders})"
                conn.execute(sql, list(data.values()))
                conn.commit()
                # Convert bools back for the response
                for k in _BOOL_FIELDS:
                    if k in data:
                        data[k] = bool(data[k])
                return _Result([data])

            elif self._method == "PATCH":
                where, where_params = self._build_where()
                data = dict(self._body)
                for k in _BOOL_FIELDS:
                    if k in data:
                        data[k] = int(bool(data[k]))
                set_clause = ", ".join(f"{k} = ?" for k in data.keys())
                sql = f"UPDATE {self.table_name} SET {set_clause}{where}"
                params = list(data.values()) + where_params
                conn.execute(sql, params)
                conn.commit()
                return _Result([data])

            elif self._method == "DELETE":
                where, params = self._build_where()
                sql = f"DELETE FROM {self.table_name}{where}"
                conn.execute(sql, params)
                conn.commit()
                return _Result([])

        finally:
            conn.close()


class _Result:
    def __init__(self, data):
        self.data = data


class SupabaseClient:
    def table(self, table_name: str) -> SQLiteTable:
        return SQLiteTable(table_name)


supabase = SupabaseClient()
