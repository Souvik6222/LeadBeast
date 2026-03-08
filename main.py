"""
AI Lead Intelligence Platform — FastAPI Main Application
Built on the WAT Framework (Workflows, Agents, Tools)
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.routes.leads import router as leads_router
from api.routes.analytics import router as analytics_router
from api.routes.auth import router as auth_router
from api.routes.pipeline import router as pipeline_router
from api.routes.generate import router as generate_router

app = FastAPI(
    title="AI Lead Intelligence Platform",
    description="Know Who to Call Before You Dial — ML-powered lead scoring and prioritization",
    version="1.0.0",
)

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router, prefix="/v1", tags=["Auth"])
app.include_router(leads_router, prefix="/v1", tags=["Leads"])
app.include_router(analytics_router, prefix="/v1", tags=["Analytics"])
app.include_router(pipeline_router, prefix="/v1", tags=["Pipeline"])
app.include_router(generate_router, prefix="/v1", tags=["AI Generate"])


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Lead Intelligence Platform",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }


@app.get("/")
async def root():
    return {
        "message": "AI Lead Intelligence Platform API",
        "docs": "/docs",
        "health": "/health",
    }
