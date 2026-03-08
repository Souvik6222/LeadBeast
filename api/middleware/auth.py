"""
Authentication utilities — Supabase JWT verification
"""
import os
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db.client import get_supabase_service_client

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Verify JWT token and return user data."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="No authorization token provided")

    token = credentials.credentials
    try:
        supabase = get_supabase_service_client()
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user profile from our users table
        user_data = (
            supabase.table("users")
            .select("*")
            .eq("id", str(user_response.user.id))
            .single()
            .execute()
        )
        
        if not user_data.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return user_data.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Get user if token present, None otherwise."""
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
