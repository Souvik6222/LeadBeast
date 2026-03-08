"""
Pydantic models for the Lead Intelligence Platform
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


# --- Enums ---
class LeadStatus(str, Enum):
    NEW = "new"
    ENRICHING = "enriching"
    SCORED = "scored"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"
    CONVERTED = "converted"


class Tier(str, Enum):
    HOT = "Hot"
    WARM = "Warm"
    COLD = "Cold"


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    REP = "rep"


class SeniorityLevel(str, Enum):
    IC = "IC"
    MANAGER = "Manager"
    DIRECTOR = "Director"
    VP = "VP"
    C_SUITE = "C-Suite"


class ActivityType(str, Enum):
    CALLED = "called"
    EMAILED = "emailed"
    MEETING_BOOKED = "meeting_booked"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"
    CONVERTED = "converted"


class JobType(str, Enum):
    ENRICH = "enrich"
    SCORE = "score"
    RESEARCH = "research"
    EMAIL = "email"


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"
    DEAD_LETTER = "dead_letter"


class SignalType(str, Enum):
    SIGNAL_FUNDING = "SIGNAL_FUNDING"
    SIGNAL_HIRING = "SIGNAL_HIRING"
    SIGNAL_HIRING_SALES = "SIGNAL_HIRING_SALES"
    SIGNAL_GROWTH = "SIGNAL_GROWTH"
    SIGNAL_TECH_ADOPT = "SIGNAL_TECH_ADOPT"
    SIGNAL_EXECUTIVE = "SIGNAL_EXECUTIVE"
    SIGNAL_EXPANSION = "SIGNAL_EXPANSION"
    SIGNAL_CONTENT = "SIGNAL_CONTENT"
    SIGNAL_AWARD = "SIGNAL_AWARD"
    SIGNAL_IPO = "SIGNAL_IPO"


# --- Request Models ---
class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    company: str
    company_website: Optional[str] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    lead_source: Optional[str] = None
    utm_source: Optional[str] = None
    utm_campaign: Optional[str] = None
    seniority_level: Optional[SeniorityLevel] = None


class LeadBulkCreate(BaseModel):
    leads: List[LeadCreate]
    auto_enrich: bool = True


class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    company_website: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    lead_status: Optional[LeadStatus] = None
    assigned_to: Optional[str] = None
    seniority_level: Optional[SeniorityLevel] = None


class ActivityCreate(BaseModel):
    activity_type: ActivityType
    outcome: Optional[str] = None
    notes: Optional[str] = None
    duration_seconds: Optional[int] = None


class LeadFilter(BaseModel):
    page: int = 1
    per_page: int = 25
    sort_by: str = "current_score"
    sort_order: str = "desc"
    tier: Optional[str] = None
    status: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    lead_source: Optional[str] = None
    assigned_to: Optional[str] = None
    search: Optional[str] = None


# --- Response Models ---
class LeadSummary(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    company: str
    title: Optional[str] = None
    current_score: Optional[float] = None
    tier: Optional[str] = None
    lead_status: str = "new"
    enrichment_status: str = "pending"
    lead_source: Optional[str] = None
    created_at: Optional[str] = None
    last_scored_at: Optional[str] = None


class LeadDetail(LeadSummary):
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    seniority_level: Optional[str] = None
    company_website: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    buying_intent_score: Optional[float] = None
    assigned_to: Optional[str] = None
    enrichment: Optional[dict] = None
    signals: Optional[list] = None
    latest_score: Optional[dict] = None
    score_history: Optional[list] = None
    ai_content: Optional[dict] = None
    activity: Optional[list] = None


class AnalyticsSummary(BaseModel):
    total_leads: int = 0
    hot_leads: int = 0
    warm_leads: int = 0
    cold_leads: int = 0
    avg_score: float = 0.0
    meetings_booked_30d: int = 0
    new_leads_7d: int = 0
    scored_leads: int = 0


class BulkCreateResponse(BaseModel):
    created: int = 0
    updated: int = 0
    skipped: int = 0
    errors: List[str] = []
