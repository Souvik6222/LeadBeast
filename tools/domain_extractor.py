"""
Domain Extractor Tool — extracts company domain from email or URL
WAT Layer 3: Deterministic Tool
"""
import re
from urllib.parse import urlparse


def extract_domain_from_email(email: str) -> str | None:
    """Extract company domain from email address."""
    if not email or '@' not in email:
        return None
    
    domain = email.split('@')[1].lower()
    
    # Skip personal email providers
    free_providers = {
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'aol.com', 'icloud.com', 'protonmail.com', 'mail.com',
        'yandex.com', 'live.com', 'msn.com',
    }
    
    if domain in free_providers:
        return None
    
    return domain


def extract_domain_from_url(url: str) -> str | None:
    """Extract domain from a website URL."""
    if not url:
        return None
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove www prefix
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except Exception:
        return None


def get_company_domain(email: str = None, website: str = None) -> str | None:
    """Get company domain from email or website, preferring website."""
    domain = None
    
    if website:
        domain = extract_domain_from_url(website)
    
    if not domain and email:
        domain = extract_domain_from_email(email)
    
    return domain
