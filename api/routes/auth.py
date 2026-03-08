"""
Auth routes — signup, login, user profile
Uses Supabase Auth via direct HTTP calls (bypasses Python client realtime bug)
"""
import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from db.client import get_supabase_service_client

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    organization_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


def _supabase_auth_sign_in(email: str, password: str) -> dict:
    """Sign in via Supabase GoTrue REST API directly (avoids Python client realtime bug)."""
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    payload = {"email": email, "password": password}
    
    with httpx.Client(timeout=30) as client:
        resp = client.post(url, json=payload, headers=headers)
    
    if resp.status_code != 200:
        data = resp.json()
        raise Exception(data.get("error_description") or data.get("msg") or "Sign in failed")
    
    return resp.json()


@router.post("/auth/signup")
async def signup(req: SignupRequest):
    """Sign up a new user + create organization."""
    try:
        supabase = get_supabase_service_client()

        # 1. Create user in Supabase Auth (admin API)
        try:
            auth_response = supabase.auth.admin.create_user({
                "email": req.email,
                "password": req.password,
                "email_confirm": True,
            })
        except Exception as auth_err:
            error_str = str(auth_err).lower()
            if "already" in error_str or "duplicate" in error_str or "exists" in error_str:
                raise HTTPException(
                    status_code=400,
                    detail="An account with this email already exists. Please sign in."
                )
            print(f"[SIGNUP] Auth error: {auth_err}")
            raise HTTPException(status_code=400, detail=f"Auth error: {str(auth_err)}")

        if not auth_response or not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user in auth system")

        user_id = str(auth_response.user.id)
        print(f"[SIGNUP] Created auth user: {user_id}")

        # 2. Create organization
        try:
            org_result = (
                supabase.table("organizations")
                .insert({"name": req.organization_name})
                .execute()
            )
            org_id = org_result.data[0]["id"]
            print(f"[SIGNUP] Created org: {org_id}")
        except Exception as org_err:
            print(f"[SIGNUP] Org creation error: {org_err}")
            try:
                supabase.auth.admin.delete_user(user_id)
            except Exception:
                pass
            raise HTTPException(status_code=400, detail=f"Org creation error: {str(org_err)}")

        # 3. Create user profile linked to org
        try:
            supabase.table("users").insert({
                "id": user_id,
                "organization_id": org_id,
                "email": req.email,
                "full_name": req.full_name,
                "role": "admin",
            }).execute()
            print(f"[SIGNUP] Created user profile")
        except Exception as user_err:
            print(f"[SIGNUP] User profile error: {user_err}")
            raise HTTPException(status_code=400, detail=f"User profile error: {str(user_err)}")

        # 4. Sign in to get tokens via direct REST API (bypasses Python client realtime bug)
        try:
            auth_data = _supabase_auth_sign_in(req.email, req.password)
            print(f"[SIGNUP] Login successful, token obtained")
        except Exception as login_err:
            print(f"[SIGNUP] Login after signup error: {login_err}")
            raise HTTPException(status_code=400, detail=f"Login after signup error: {str(login_err)}")

        return {
            "user": {
                "id": user_id,
                "email": req.email,
                "full_name": req.full_name,
                "role": "admin",
                "organization_id": org_id,
            },
            "session": {
                "access_token": auth_data["access_token"],
                "refresh_token": auth_data["refresh_token"],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[SIGNUP] Unexpected error: {e}")
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")


@router.post("/auth/login")
async def login(req: LoginRequest):
    """Log in with email + password."""
    try:
        # Use direct REST API (avoids Python client realtime bug)
        auth_data = _supabase_auth_sign_in(req.email, req.password)

        user_id = auth_data.get("user", {}).get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Get user profile
        service = get_supabase_service_client()
        user_data = (
            service.table("users")
            .select("*, organizations(name, plan_tier)")
            .eq("id", user_id)
            .single()
            .execute()
        )

        return {
            "user": user_data.data,
            "session": {
                "access_token": auth_data["access_token"],
                "refresh_token": auth_data["refresh_token"],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/auth/me")
async def get_me(user=Depends(
    __import__("api.middleware.auth", fromlist=["get_current_user"]).get_current_user
)):
    """Get current user profile."""
    return {"user": user}


@router.get("/auth/check-profile")
async def check_profile(user=Depends(
    __import__("api.middleware.auth", fromlist=["get_current_user"]).get_current_user
)):
    """Check if the authenticated user has a profile (for Google OAuth onboarding)."""
    return {"has_profile": user is not None and user.get("organization_id") is not None}


class GoogleOnboardRequest(BaseModel):
    full_name: str
    organization_name: str
    user_id: str
    email: str


@router.post("/auth/google-onboard")
async def google_onboard(req: GoogleOnboardRequest):
    """Create org + profile for a new Google OAuth user."""
    try:
        service = get_supabase_service_client()

        # Check if user profile already exists
        existing = service.table("users").select("id").eq("id", req.user_id).execute()
        if existing.data:
            return {"success": True, "message": "Profile already exists"}

        # Create organization
        org = service.table("organizations").insert({
            "name": req.organization_name,
            "plan_tier": "free",
        }).execute()

        if not org.data:
            raise HTTPException(status_code=500, detail="Failed to create organization")

        org_id = org.data[0]["id"]

        # Create user profile linked to the org
        service.table("users").insert({
            "id": req.user_id,
            "email": req.email,
            "full_name": req.full_name,
            "organization_id": org_id,
            "role": "admin",
        }).execute()

        return {"success": True, "organization_id": org_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

