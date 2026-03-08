"""
News API Tool — fetches recent company news for signal detection
WAT Layer 3: Deterministic Tool (Free tier: 100 requests/day)
"""
import os
import httpx
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
NEWSAPI_URL = "https://newsapi.org/v2/everything"


async def search_company_news(company_name: str, days_back: int = 30) -> list:
    """Search for recent news about a company using NewsAPI."""
    if not NEWSAPI_KEY:
        return []
    
    from_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(NEWSAPI_URL, params={
                "q": f'"{company_name}"',
                "from": from_date,
                "sortBy": "relevancy",
                "pageSize": 5,
                "apiKey": NEWSAPI_KEY,
                "language": "en",
            })
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            articles = data.get("articles", [])
            
            results = []
            for article in articles:
                results.append({
                    "title": article.get("title"),
                    "description": article.get("description"),
                    "url": article.get("url"),
                    "published_at": article.get("publishedAt"),
                    "source": article.get("source", {}).get("name"),
                })
            
            return results
            
    except Exception:
        return []


def detect_funding_signal(articles: list) -> dict | None:
    """Detect funding signals from news articles."""
    funding_keywords = [
        "raised", "funding", "series a", "series b", "series c", "series d",
        "seed round", "venture", "investment", "capital", "million", "billion",
        "ipo", "valuation",
    ]
    
    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        if any(kw in text for kw in funding_keywords):
            return {
                "signal_type": "SIGNAL_FUNDING",
                "signal_description": article.get("title", "Funding activity detected"),
                "signal_source": article.get("url", "NewsAPI"),
                "signal_date": article.get("published_at", "")[:10],
                "signal_strength": 8,
            }
    return None


def detect_hiring_signal(articles: list) -> dict | None:
    """Detect hiring signals from news articles."""
    hiring_keywords = [
        "hiring", "new hire", "appointed", "joins", "named",
        "ceo", "cto", "cfo", "vp", "head of", "expansion",
    ]
    
    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        if any(kw in text for kw in hiring_keywords):
            return {
                "signal_type": "SIGNAL_EXECUTIVE",
                "signal_description": article.get("title", "Executive change detected"),
                "signal_source": article.get("url", "NewsAPI"),
                "signal_date": article.get("published_at", "")[:10],
                "signal_strength": 6,
            }
    return None


def detect_growth_signal(articles: list) -> dict | None:
    """Detect growth signals from news articles."""
    growth_keywords = [
        "expansion", "launch", "new market", "growth", "partnership",
        "acquisition", "acquired", "award", "recognition",
    ]
    
    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        if any(kw in text for kw in growth_keywords):
            return {
                "signal_type": "SIGNAL_EXPANSION",
                "signal_description": article.get("title", "Growth activity detected"),
                "signal_source": article.get("url", "NewsAPI"),
                "signal_date": article.get("published_at", "")[:10],
                "signal_strength": 5,
            }
    return None
