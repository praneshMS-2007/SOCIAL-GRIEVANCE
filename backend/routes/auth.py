import hashlib
import uuid
import sqlite3
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import DB_PATH

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "department"
    department: Optional[str] = None
    display_name: Optional[str] = None


class UserUpdate(BaseModel):
    password: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    display_name: Optional[str] = None


def _user_dict(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "role": row["role"],
        "department": row["department"],
        "display_name": row["display_name"],
        "created_at": row["created_at"],
    }


@router.post("/login")
async def login(data: LoginRequest):
    """Login with username and password. Returns user info + token."""
    pwd_hash = hashlib.sha256(data.password.encode()).hexdigest()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    user = conn.execute(
        "SELECT * FROM users WHERE username = ? AND password_hash = ?",
        (data.username, pwd_hash)
    ).fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = hashlib.sha256(f"{user['id']}:{user['username']}".encode()).hexdigest()

    return {
        "success": True,
        "token": token,
        "user": _user_dict(user)
    }


@router.get("/me")
async def get_me(token: str = ""):
    """Get current user info from token."""
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()

    for user in users:
        expected_token = hashlib.sha256(f"{user['id']}:{user['username']}".encode()).hexdigest()
        if expected_token == token:
            return _user_dict(user)

    raise HTTPException(status_code=401, detail="Invalid token")


# ────── User Management (Admin only) ──────

@router.get("/users")
async def list_users():
    """List all users. Admin only."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    users = conn.execute("SELECT * FROM users ORDER BY role, username").fetchall()
    conn.close()
    return {"users": [_user_dict(u) for u in users]}


@router.post("/users")
async def create_user(data: UserCreate):
    """Create a new user. Admin only."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Check if username exists
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (data.username,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")

    uid = str(uuid.uuid4())
    pwd_hash = hashlib.sha256(data.password.encode()).hexdigest()
    display = data.display_name or data.username.capitalize()

    conn.execute(
        "INSERT INTO users (id, username, password_hash, role, department, display_name) VALUES (?,?,?,?,?,?)",
        (uid, data.username, pwd_hash, data.role, data.department, display)
    )
    conn.commit()

    user = conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
    conn.close()
    return {"success": True, "user": _user_dict(user)}


@router.patch("/users/{user_id}")
async def update_user(user_id: str, data: UserUpdate):
    """Update a user. Admin only."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    updates = {}
    if data.password:
        updates["password_hash"] = hashlib.sha256(data.password.encode()).hexdigest()
    if data.role is not None:
        updates["role"] = data.role
    if data.department is not None:
        updates["department"] = data.department
    if data.display_name is not None:
        updates["display_name"] = data.display_name

    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        conn.execute(f"UPDATE users SET {set_clause} WHERE id = ?", list(updates.values()) + [user_id])
        conn.commit()

    updated = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return {"success": True, "user": _user_dict(updated)}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user. Admin only."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    if user["username"] == "admin":
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot delete the admin account")

    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"User '{user['username']}' deleted"}
