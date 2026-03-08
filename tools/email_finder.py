"""
Email Finder Tool — generates & verifies professional emails from name + domain
WAT Layer 3: Deterministic Tool (Free - no API key needed)

Replaces Hunter.io email finder functionality using:
  1. Common email pattern generation (first.last@, f.last@, etc.)
  2. MX record validation
  3. Optional SMTP verification (catch-all detection)
"""
import re
import socket
import smtplib
import dns.resolver
from typing import Optional


# Common email patterns used by companies, ordered by popularity
EMAIL_PATTERNS = [
    "{first}.{last}",       # john.doe@company.com  (most common)
    "{first}{last}",        # johndoe@company.com
    "{f}{last}",            # jdoe@company.com
    "{first}_{last}",       # john_doe@company.com
    "{first}",              # john@company.com
    "{last}.{first}",       # doe.john@company.com
    "{f}.{last}",           # j.doe@company.com
    "{last}{f}",            # doej@company.com
    "{first}-{last}",       # john-doe@company.com
    "{last}",               # doe@company.com
    "{f}{last}{fi}",        # jdoe1@ (with first initial as numeric hack — skip)
    "{first}.{l}",          # john.d@company.com
]


def _clean_name(name: str) -> str:
    """Remove special characters and normalize a name part."""
    return re.sub(r'[^a-z]', '', name.lower().strip())


def generate_email_patterns(first_name: str, last_name: str, domain: str) -> list[str]:
    """Generate possible email addresses from name parts and domain."""
    first = _clean_name(first_name)
    last = _clean_name(last_name)

    if not first or not last or not domain:
        return []

    f = first[0]   # first initial
    l = last[0]    # last initial

    emails = []
    for pattern in EMAIL_PATTERNS:
        try:
            email = pattern.format(first=first, last=last, f=f, l=l, fi="")
            emails.append(f"{email}@{domain}")
        except (KeyError, IndexError):
            continue

    return emails


def check_mx_record(domain: str) -> list[str]:
    """Get MX records for a domain, sorted by priority."""
    try:
        records = dns.resolver.resolve(domain, 'MX')
        mx_hosts = sorted(records, key=lambda r: r.preference)
        return [str(r.exchange).rstrip('.') for r in mx_hosts]
    except Exception:
        return []


def verify_email_smtp(email: str, mx_hosts: list[str], timeout: int = 10) -> dict:
    """
    Verify an email address via SMTP RCPT TO command.
    
    Returns dict with:
      - exists: True/False/None (None = inconclusive)
      - catch_all: True if server accepts any address
      - smtp_response: raw response code
    """
    result = {"exists": None, "catch_all": False, "smtp_response": ""}

    if not mx_hosts:
        return result

    sender = "verify@leadgen-check.com"

    for mx_host in mx_hosts[:2]:  # Try top 2 MX servers
        try:
            smtp = smtplib.SMTP(timeout=timeout)
            smtp.connect(mx_host, 25)
            smtp.ehlo("leadgen-check.com")

            smtp.mail(sender)
            code, msg = smtp.rcpt(email)
            result["smtp_response"] = f"{code} {msg.decode('utf-8', errors='ignore')}"

            if code == 250:
                result["exists"] = True
            elif code in (550, 551, 552, 553):
                result["exists"] = False

            # Catch-all detection: test with a random address
            import uuid
            fake_email = f"{uuid.uuid4().hex[:12]}@{email.split('@')[1]}"
            fake_code, _ = smtp.rcpt(fake_email)
            if fake_code == 250:
                result["catch_all"] = True
                # If catch-all, we can't be sure
                result["exists"] = None

            smtp.quit()
            break
        except (smtplib.SMTPException, socket.error, OSError):
            continue

    return result


def find_email(
    first_name: str,
    last_name: str,
    domain: str,
    verify_smtp: bool = True,
) -> dict:
    """
    Find the most likely professional email for a person at a company.

    Args:
        first_name: Person's first name
        last_name: Person's last name
        domain: Company domain (e.g. "acme.com")
        verify_smtp: Whether to attempt SMTP verification

    Returns:
        dict with best_email, all_candidates, confidence, verification details
    """
    result = {
        "first_name": first_name,
        "last_name": last_name,
        "domain": domain,
        "best_email": None,
        "confidence": "low",
        "all_candidates": [],
        "has_mx": False,
        "is_catch_all": False,
        "method": "pattern_generation",
    }

    # Step 1: Check if domain has MX records
    mx_hosts = check_mx_record(domain)
    result["has_mx"] = len(mx_hosts) > 0

    if not mx_hosts:
        result["confidence"] = "none"
        return result

    # Step 2: Generate candidate emails
    candidates = generate_email_patterns(first_name, last_name, domain)
    result["all_candidates"] = candidates

    if not candidates:
        return result

    # Step 3: If SMTP verification is enabled, try to verify each candidate
    if verify_smtp:
        for email in candidates:
            smtp_result = verify_email_smtp(email, mx_hosts)

            if smtp_result["catch_all"]:
                result["is_catch_all"] = True
                result["best_email"] = candidates[0]  # Most common pattern
                result["confidence"] = "medium"
                result["method"] = "pattern_generation + catch_all_domain"
                return result

            if smtp_result["exists"] is True:
                result["best_email"] = email
                result["confidence"] = "high"
                result["method"] = "smtp_verified"
                return result

            if smtp_result["exists"] is False:
                continue  # This one doesn't exist, try next

    # Step 4: Fallback — return the most common pattern as best guess
    result["best_email"] = candidates[0]
    result["confidence"] = "medium" if result["has_mx"] else "low"
    result["method"] = "pattern_guess"

    return result


def find_emails_bulk(
    contacts: list[dict],
    verify_smtp: bool = True,
) -> list[dict]:
    """
    Find emails for multiple contacts.

    Each contact dict should have: first_name, last_name, domain (or company_website)
    """
    results = []
    for contact in contacts:
        domain = contact.get("domain") or ""
        if not domain and contact.get("company_website"):
            from tools.domain_extractor import extract_domain_from_url
            domain = extract_domain_from_url(contact["company_website"]) or ""

        result = find_email(
            first_name=contact.get("first_name", ""),
            last_name=contact.get("last_name", ""),
            domain=domain,
            verify_smtp=verify_smtp,
        )
        results.append(result)

    return results
