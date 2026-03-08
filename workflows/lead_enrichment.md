---
WORKFLOW: Lead Enrichment
VERSION: 1.0
TRIGGER: New lead ingested or manual re-enrichment requested
---

## Objective

Enrich a raw lead record with company and person-level data from free sources.

## Required Input
- lead_id: UUID of the lead to enrich
- organization_id: UUID of the organization

## Steps

1. **Extract company domain** from email or website field
   - Tool: `tools/domain_extractor.py`
   - If email is from free provider (gmail, yahoo), use company_website instead
   - If no domain found, mark enrichment as "partial" and skip to step 5

2. **Scrape company website** for basic info
   - Tool: `tools/web_scraper.py`
   - Extract: company name, description from meta tags
   - Timeout: 15 seconds max
   - If 404 or error: proceed to step 3

3. **Search for company info** via DuckDuckGo API
   - Tool: `tools/web_scraper.py` → `search_company_info()`
   - Extract: description, website URL
   - This is a free fallback for company data

4. **Validate email** deliverability
   - Tool: `tools/email_validation.py`
   - Check: format validation + MX record lookup
   - Store: email_verified, email_deliverable, is_professional

5. **Detect buying signals** from news
   - Tool: `tools/news_api.py`
   - Search company name in NewsAPI (100 free requests/day)
   - Detect: funding, hiring, growth, executive change signals
   - Create signal records in lead_signals table

6. **Calculate enrichment completeness**
   - Count filled fields / total possible fields × 100
   - Store as enrichment_completeness_pct

7. **Update lead record**
   - Set enrichment_status = 'complete' or 'partial'
   - Set last_enriched_at = NOW()

8. **Trigger scoring pipeline**
   - Queue a 'score' job in enrichment_jobs table

## Error Handling
- If any API fails: continue with remaining sources
- If all APIs fail: set enrichment_status = 'failed'
- Retry up to 3 times with exponential backoff
- Log all errors for debugging

## Output
- Enriched lead_enrichment record
- Lead signals in lead_signals table
- Updated lead status
