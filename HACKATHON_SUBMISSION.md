# Lead Beast: Intelligent Lead Prioritization for Sales Acceleration

## Short Description (Elevator Pitch)
Lead Beast is an AI-powered B2B prospecting platform that revolutionizes sales acceleration by combining multi-source web scraping with intelligent Lead Prioritization. Designed to automate the heavy lifting of sales research, Lead Beast seamlessly uncovers high-value prospects, verifies their contact data, and mathematically scores them using the BANT framework (Budget, Authority, Need, Timeline)—ensuring your sales team only focuses on the hottest deals.

## Full Project Flow & Architecture Description
Built to solve the challenge of "Intelligent Lead Prioritization for Sales Acceleration," our application, Lead Beast, transforms raw internet data into prioritized, actionable sales pipelines.

### Key Features & Workflow
1. **Beast Scraper (Manual Discovery & Curation)**
   - The Beast Scraper is our hyper-targeted search engine. Users enter specialized parameters (e.g., job titles, target keywords, geographical locations) and select cross-platform data sources like LinkedIn, X (Twitter), Reddit, or Yelp.
   - *The Workflow Flow:* To empower sales reps with control over their pipeline purity, the Beast Scraper **does not** automatically push every scraped result to the master Lead Manager. Instead, it presents a rich preview of the scraped entities. The user manually curates and selects only the highest-quality prospects to "Save to Manager", keeping the CRM clutter-free.

2. **Lead Generator (Automated Pipeline Engine)**
   - The Lead Generator handles massive-scale automated prospecting. By simply entering a target industry and general persona, the AI engine dynamically generates fully fleshed-out synthetic leads featuring realistic names, company profiles, and contact details.
   - *The Workflow Flow:* Unlike the Beast Scraper, the Lead Generator is designed for volume velocity. Generated leads are **automatically** saved and pushed directly to the Lead Manager dashboard, instantly populating the sales pipeline with fresh prospects.

3. **Intelligent Lead Scoring (The Brain)**
   - Once leads enter the Lead Manager (either manually curated from the Scraper or automatically injected from the Generator), our scoring engine goes to work.
   - Utilizing AI-driven natural language analysis and structural heuristics, each lead is evaluated against the classic **BANT framework**. 
   - Based on their titles, company sizes, tech stack detection, and social signals, leads are assigned an exact algorithmic score (0-100) and categorized into **Hot, Warm, or Cold** tiers.

4. **Bulk Email Verification**
   - Bad data wastes time. We built a drag-and-drop Bulk Email Verifier that scans prospect emails, filtering out role-based, disposable, and invalid addresses in real-time before outreach campaigns begin.

### Technical Execution
- **Frontend:** Next.js (React) leveraging Shadcn UI and Tailwind CSS for a premium, hyper-responsive user experience.
- **Backend:** High-performance Python FastAPI engine handling real-time asynchronous scraping and AI logic.
- **Database & Auth:** Supabase (PostgreSQL) handling secure JWT Google OAuth and maintaining strict relational integrity between user organizations, scraped leads, and sales activities.
