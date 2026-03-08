"""
Web Scraper Tool — scrapes company website for enrichment data
WAT Layer 3: Deterministic Tool (Free - no API needed)
"""
import httpx
from bs4 import BeautifulSoup
import re
import json


async def scrape_company_website(domain: str) -> dict:
    """Scrape a company's website for basic information."""
    result = {
        "domain": domain,
        "company_name": None,
        "description": None,
        "found": False,
    }
    
    if not domain:
        return result
    
    url = f"https://{domain}"
    
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            
            if response.status_code != 200:
                return result
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract title
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.get_text().strip()
                # Clean up common title patterns
                for sep in [' | ', ' - ', ' — ', ' – ']:
                    if sep in title:
                        result["company_name"] = title.split(sep)[0].strip()
                        break
                else:
                    result["company_name"] = title
            
            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                result["description"] = meta_desc.get('content', '').strip()[:500]
            
            # Look for OG description as fallback
            if not result["description"]:
                og_desc = soup.find('meta', attrs={'property': 'og:description'})
                if og_desc:
                    result["description"] = og_desc.get('content', '').strip()[:500]
            
            result["found"] = True
            
    except Exception as e:
        result["error"] = str(e)
    
    return result


async def search_company_info(company_name: str) -> dict:
    """Search for company info using DuckDuckGo Instant Answer API (free)."""
    result = {
        "company_name": company_name,
        "description": None,
        "website": None,
        "found": False,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.duckduckgo.com/",
                params={
                    "q": f"{company_name} company",
                    "format": "json",
                    "no_html": 1,
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("AbstractText"):
                    result["description"] = data["AbstractText"][:500]
                    result["found"] = True
                if data.get("AbstractURL"):
                    result["website"] = data["AbstractURL"]
                
    except Exception as e:
        result["error"] = str(e)
    
    return result
