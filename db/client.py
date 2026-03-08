"""
Supabase database client - singleton connection
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_supabase_client() -> Client:
    """Get or create Supabase client (anon key - for RLS-scoped operations)."""
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
        _client = create_client(url, key)
    return _client


_service_client: Client | None = None


def get_supabase_service_client() -> Client:
    """Get or create Supabase service client (bypasses RLS - for backend operations)."""
    global _service_client
    if _service_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        _service_client = create_client(url, key)
    return _service_client


def get_fresh_supabase_client() -> Client:
    """Create a FRESH Supabase client for auth operations.
    This avoids the singleton sharing auth state across requests.
    Always use this for sign_in_with_password and other auth methods."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    return create_client(url, key)

