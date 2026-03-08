"""
Email Validation Tool — validates email format and MX records
WAT Layer 3: Deterministic Tool (Free - no API needed)
"""
import re
import dns.resolver


def validate_email_format(email: str) -> bool:
    """Validate email format using regex."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def check_mx_record(domain: str) -> bool:
    """Check if domain has MX records (can receive email)."""
    try:
        records = dns.resolver.resolve(domain, 'MX')
        return len(records) > 0
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
        return False
    except Exception:
        return False


def validate_email(email: str) -> dict:
    """Full email validation: format + MX check."""
    result = {
        "email": email,
        "is_valid_format": False,
        "has_mx_record": False,
        "is_deliverable": False,
        "is_professional": False,
    }
    
    if not email:
        return result
    
    # Format check
    result["is_valid_format"] = validate_email_format(email)
    if not result["is_valid_format"]:
        return result
    
    domain = email.split('@')[1].lower()
    
    # Professional check (not free email provider)
    free_providers = {
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'aol.com', 'icloud.com', 'protonmail.com', 'mail.com',
    }
    result["is_professional"] = domain not in free_providers
    
    # MX record check
    result["has_mx_record"] = check_mx_record(domain)
    result["is_deliverable"] = result["is_valid_format"] and result["has_mx_record"]
    
    return result
