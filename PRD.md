================================================================================
         AI LEAD INTELLIGENCE PLATFORM — PRODUCT REQUIREMENTS DOCUMENT
                         Version 1.0  |  Confidential
================================================================================

Prepared by  : Senior Product Manager (Ex-Stripe / Salesforce)
Status       : Draft — Ready for Engineering Review
Last Updated : 2025
Classification: Internal — Do Not Distribute


================================================================================
TABLE OF CONTENTS
================================================================================

  1.  Product Overview
  2.  Problem Statement
  3.  Target Users
  4.  User Personas
  5.  User Stories
  6.  Functional Requirements
  7.  Non-Functional Requirements
  8.  System Architecture (WAT Framework)
  9.  AI Architecture
  10. Database Schema
  11. API Design
  12. UI/UX Design
  13. Automation Workflows
  14. Deployment Architecture
  15. Success Metrics
  16. Future Improvements
  17. Hackathon Winning Strategy & Monetization


================================================================================
SECTION 1 — PRODUCT OVERVIEW
================================================================================

Product Name     : AI Lead Intelligence Platform
Tagline          : Know Who to Call Before You Dial
Product Type     : B2B SaaS — Sales Intelligence & Lead Prioritization
Target Market    : SMB to Mid-Market Sales Teams (5–500 reps)
Pricing Model    : Subscription SaaS (Freemium → Pro → Enterprise)
Primary Outcome  : Increase sales-qualified-lead (SQL) conversion rate by 30–50%
                   and reduce time-to-first-contact by 60%

--------------------------------------------------------------------------------
Product Summary
--------------------------------------------------------------------------------

The AI Lead Intelligence Platform is an end-to-end intelligent lead
prioritization system that automatically enriches raw lead data, detects
company-level buying signals, scores leads using machine learning, and
surfaces the highest-probability opportunities to sales reps through a
modern SaaS dashboard.

The system ingests raw leads (name, email, company, website, industry,
location), enriches them using external APIs and web scraping, runs a
trained ML model to predict conversion probability, assigns a Hot / Warm /
Cold classification, and presents actionable AI-generated insights so reps
know exactly who to call, when to call, and what to say.

The architecture is built on the WAT Framework (Workflows, Agents, Tools)
ensuring modularity, explainability, and ease of extension. The backend
runs on Python + FastAPI with Supabase as the primary database, and the
frontend is a Next.js SaaS dashboard with Tailwind CSS, Shadcn UI, and
Recharts.

--------------------------------------------------------------------------------
Core Value Propositions
--------------------------------------------------------------------------------

  VP-1  : Reps spend 100% of their time on leads most likely to convert
  VP-2  : AI-generated explanations tell reps WHY a lead is hot
  VP-3  : Real-time buying signals (funding, hiring, tech adoption) surface
          automatically — no manual research required
  VP-4  : Personalized AI-drafted email templates per lead
  VP-5  : Model performance transparency builds trust with sales leadership
  VP-6  : Seamless CRM-ready export — integrates with Salesforce, HubSpot


================================================================================
SECTION 2 — PROBLEM STATEMENT
================================================================================

--------------------------------------------------------------------------------
2.1 Market Context
--------------------------------------------------------------------------------

Modern B2B sales teams operate in a volume game. Marketing teams push
hundreds to thousands of leads per month into CRM systems. Sales reps,
typically working a full pipeline, must manually evaluate each lead to
decide where to invest their limited time.

This creates a structural inefficiency:

  - Average SDR spends 65% of their time on leads that will never convert
    (source: Salesforce State of Sales, 2023)
  - Average lead response time is 42 hours, while leads contacted within
    5 minutes are 21x more likely to convert (source: Harvard Business Review)
  - Only 27% of leads passed by marketing to sales are ever contacted
    (source: MarketingSherpa)
  - Manual lead research takes 30–45 minutes per lead on average

--------------------------------------------------------------------------------
2.2 Core Pain Points
--------------------------------------------------------------------------------

PAIN-1 : No Prioritization Signal
  Sales reps receive a flat, undifferentiated list of leads with no
  indication of which ones are likely to buy. Reps default to FIFO order
  (first-in, first-out) or random selection — neither of which is
  correlated with conversion probability.

PAIN-2 : Missing Context
  Reps must manually research each company before a call: checking
  LinkedIn, Crunchbase, company website, news articles. This research
  is time-consuming, inconsistent, and often skipped entirely.

PAIN-3 : No Buying Signal Detection
  Events that indicate purchase intent — a company raising a Series B,
  posting 20 new sales job listings, adopting a new tech stack — are
  powerful buying signals. Sales teams have no automated system to detect
  these signals across their lead list.

PAIN-4 : Inability to Explain Prioritization Decisions
  Even when teams implement basic scoring (e.g., firmographic rules),
  reps don't trust black-box scores. Without an explanation of WHY a
  lead is scored highly, adoption of the scoring system is low.

PAIN-5 : No Feedback Loop
  Lead outcomes (converted / not converted) are not fed back into scoring
  logic. Models don't improve over time. Scores from 6 months ago are as
  stale as they were the day they were created.

--------------------------------------------------------------------------------
2.3 Hypothesis
--------------------------------------------------------------------------------

  If sales teams have access to enriched, ML-scored, signal-annotated,
  AI-explained lead prioritization — accessible in a clean dashboard —
  they will contact the right leads faster, have more relevant conversations,
  and close at a meaningfully higher rate.


================================================================================
SECTION 3 — TARGET USERS
================================================================================

PRIMARY USERS
  - Sales Development Representatives (SDRs) / Business Development Reps
  - Account Executives (AEs) working inbound lead queues
  - Revenue Operations (RevOps) analysts configuring the system

SECONDARY USERS
  - VP of Sales / CRO reviewing pipeline health and model performance
  - Marketing Operations teams managing lead quality

OUT OF SCOPE (v1)
  - Field sales teams (territory-based, not inbound-lead driven)
  - Consumer/B2C sales teams
  - Recruiting / HR use cases (though technology is transferable)

COMPANY PROFILES TARGETED
  - B2B SaaS companies with 10–500 employees
  - Companies receiving 200+ inbound or outbound leads per month
  - Companies using HubSpot, Salesforce, or Pipedrive as CRM
  - Industries: SaaS, FinTech, MarTech, HR Tech, DevTools


================================================================================
SECTION 4 — USER PERSONAS
================================================================================

--------------------------------------------------------------------------------
Persona 1 — Alex, the SDR
--------------------------------------------------------------------------------

  Name       : Alex Chen
  Title      : Sales Development Representative
  Age        : 25
  Company    : Series B SaaS startup, 80 employees
  Experience : 1.5 years in SDR role, hit quota 6 of last 12 months

  Goals:
    - Hit 40 qualified meetings booked per month
    - Reduce time spent on dead-end leads
    - Have talking points ready before every call

  Frustrations:
    - "I get 200 new leads every Monday and have no idea where to start"
    - "I spend 30 minutes researching a company and then they don't pick up"
    - "My manager asks why I'm not calling the right leads but there's no
      system telling me who the right leads are"

  How AI Lead Intelligence Platform Helps:
    - Dashboard shows top 20 leads to call today, ranked by score
    - AI insight card tells Alex: "Acme Corp raised $15M Series A last month,
      recently posted 5 Sales Manager roles, and uses Salesforce — strong
      buying signal for your product"
    - AI email draft ready to send in one click

  Key Metric: Meetings booked per lead contacted (conversion rate)

--------------------------------------------------------------------------------
Persona 2 — Sarah, the RevOps Lead
--------------------------------------------------------------------------------

  Name       : Sarah Okonkwo
  Title      : Revenue Operations Lead
  Age        : 32
  Company    : Mid-market SaaS, 200 employees
  Experience : 5 years in operations, previously at Salesforce

  Goals:
    - Improve lead-to-SQL conversion rate from 8% to 15%
    - Build a repeatable, data-driven sales process
    - Reduce reliance on "gut feeling" in rep prioritization

  Frustrations:
    - "We have no consistent logic for which leads get called first"
    - "I can't prove to leadership that our lead scoring is working"
    - "Our CRM data is incomplete — half the records are missing company size"

  How AI Lead Intelligence Platform Helps:
    - Configures enrichment sources and ML model weights in Settings
    - Views model performance dashboard: precision, recall, AUC over time
    - Exports enriched lead data with scores back to Salesforce via API

  Key Metric: Model AUC score, lead-to-SQL conversion lift vs. baseline

--------------------------------------------------------------------------------
Persona 3 — Marcus, the VP of Sales
--------------------------------------------------------------------------------

  Name       : Marcus Williams
  Title      : VP of Sales
  Age        : 41
  Company    : Series C SaaS, 350 employees
  Experience : 15 years in sales leadership

  Goals:
    - Forecast pipeline accurately for board reporting
    - Identify which lead sources produce the highest-value customers
    - Reduce ramp time for new SDRs

  Frustrations:
    - "I have no visibility into which leads are being worked and why"
    - "New reps waste their first 3 months calling terrible leads"
    - "I can't connect lead quality to revenue outcomes"

  How AI Lead Intelligence Platform Helps:
    - Executive dashboard showing pipeline health by lead score tier
    - Source attribution: which channels produce the most Hot leads
    - New reps immediately productive because system tells them who to call

  Key Metric: Revenue attributed to scored vs. unscored lead cohorts


================================================================================
SECTION 5 — USER STORIES
================================================================================

Format: As a [persona], I want to [action], so that [outcome].

EPIC 1 — Lead Ingestion
  US-001 : As an SDR, I want to upload a CSV of leads, so that they are
           automatically enriched and scored without manual work.
  US-002 : As a RevOps lead, I want to connect our HubSpot account via API
           key, so that new leads sync automatically every hour.
  US-003 : As an SDR, I want to add a single lead manually via a form, so
           that I can quickly assess an inbound lead before a call.

EPIC 2 — Lead Enrichment & Signals
  US-004 : As an SDR, I want to see enriched company data (size, funding,
           industry, location) on each lead, so that I don't have to
           research manually.
  US-005 : As an SDR, I want to see buying signals (recent funding, new
           hiring, tech stack changes), so that I can open conversations
           with relevant context.
  US-006 : As a RevOps lead, I want to configure which enrichment sources
           are active, so that I can manage API costs and data quality.

EPIC 3 — ML Scoring
  US-007 : As an SDR, I want each lead to have a score from 0–100 and a
           Hot/Warm/Cold label, so that I know immediately which leads to
           prioritize.
  US-008 : As a RevOps lead, I want the model to re-score leads every 24
           hours, so that scores reflect the latest enrichment data.
  US-009 : As a VP of Sales, I want to view model accuracy metrics (AUC,
           precision, recall) on a performance dashboard, so that I can
           trust the scoring system.

EPIC 4 — AI Insights & Email Generation
  US-010 : As an SDR, I want to read a 3-sentence AI explanation of why
           a lead is scored Hot, so that I have a personalized conversation
           opener ready.
  US-011 : As an SDR, I want the system to generate a personalized
           outreach email draft for each lead, so that I can send it in
           one click with minor edits.
  US-012 : As a RevOps lead, I want to configure the email tone and
           template style, so that AI emails match our brand voice.

EPIC 5 — Dashboard & Workflow
  US-013 : As an SDR, I want to see a prioritized list of today's top leads
           on my dashboard home page, so that I know exactly what to work
           on when I log in.
  US-014 : As an SDR, I want to log a call outcome (contacted / not
           interested / converted) directly in the lead detail view, so
           that my activity is tracked in one place.
  US-015 : As a VP of Sales, I want to filter the leads table by score
           tier, industry, company size, and lead source, so that I can
           analyze pipeline segments.

EPIC 6 — System & Security
  US-016 : As a RevOps lead, I want to invite team members with role-based
           access (Admin, Manager, Rep), so that each user sees only what
           is relevant to them.
  US-017 : As an Admin, I want all API keys stored encrypted and never
           exposed in the UI, so that our data sources are secure.
  US-018 : As a RevOps lead, I want to export scored leads to CSV or push
           to Salesforce via webhook, so that we can act on data in our
           existing tools.


================================================================================
SECTION 6 — FUNCTIONAL REQUIREMENTS
================================================================================

--------------------------------------------------------------------------------
6.1 Lead Ingestion Module
--------------------------------------------------------------------------------

  FR-101 : System SHALL accept lead uploads via:
             (a) CSV file upload (max 10,000 rows per upload)
             (b) REST API POST endpoint
             (c) Manual single-lead form in the UI
             (d) Webhook from HubSpot / Salesforce / Pipedrive

  FR-102 : Minimum required fields for ingestion:
             - email (required, must be valid format)
             - first_name (required)
             - last_name (required)
             - company (required)
             Optional but used in scoring:
             - company_website, industry, location, phone, title,
               linkedin_url, lead_source, utm_source

  FR-103 : System SHALL deduplicate leads by email address at ingestion time.
           Duplicate submissions SHALL update existing records, not create
           new ones.

  FR-104 : System SHALL validate email format and flag invalid entries.
           Invalid leads SHALL be placed in a "review" queue, not discarded.

  FR-105 : Upon ingestion, system SHALL immediately queue lead for enrichment
           via the background worker pipeline.

--------------------------------------------------------------------------------
6.2 Lead Enrichment Module
--------------------------------------------------------------------------------

  FR-201 : For each lead, system SHALL attempt to enrich the following
           data points:

           Company-Level Enrichment:
             - Company legal name, domain, description
             - Employee headcount (current + 6-month trend)
             - Industry classification (SIC / NAICS)
             - Founding year
             - HQ location (city, state, country)
             - Total funding raised (USD)
             - Last funding round (type, amount, date)
             - Current investors
             - Estimated ARR range (if available)
             - Technologies in use (tech stack)
             - Glassdoor rating (proxy for company health)
             - LinkedIn follower count + growth rate

           Person-Level Enrichment:
             - Full name verification
             - Current job title and seniority level
             - Time in current role (tenure)
             - LinkedIn profile URL
             - Professional email validation
             - Decision-maker classification (yes/no)

  FR-202 : Enrichment SHALL be attempted in parallel across sources.
           System SHALL handle API failures gracefully with fallback sources.
           Partial enrichment is acceptable; system SHALL score with
           available data.

  FR-203 : Enrichment results SHALL be stored in the lead_enrichment table
           with source attribution and timestamp per data point.

  FR-204 : System SHALL support re-enrichment on demand or on schedule
           (configurable: daily, weekly, monthly).

--------------------------------------------------------------------------------
6.3 Buying Signal Detection Module
--------------------------------------------------------------------------------

  FR-301 : System SHALL detect and flag the following signal types:

           SIGNAL-FUNDING    : Company raised funding in last 90 days
           SIGNAL-HIRING     : Company posted 5+ new jobs in last 30 days
           SIGNAL-HIRING_SALES: Company specifically hiring sales/revenue roles
           SIGNAL-GROWTH     : Employee count grew 20%+ in last 6 months
           SIGNAL-TECH_ADOPT : Company adopted a complementary technology
           SIGNAL-EXECUTIVE  : New C-suite or VP hired in last 60 days
           SIGNAL-EXPANSION  : Company opened new offices or markets
           SIGNAL-CONTENT    : Contact published thought leadership content
           SIGNAL-AWARD      : Company received industry award or press mention
           SIGNAL-IPO_PREP   : Company filed S-1 or announced IPO intent

  FR-302 : Each signal SHALL have:
             - signal_type (enum)
             - signal_strength (1–10 numeric)
             - signal_date
             - signal_source (URL or API name)
             - signal_description (human-readable string)

  FR-303 : Signals SHALL be surfaced on lead detail page and used as
           features in the ML scoring model.

  FR-304 : System SHALL aggregate signal_strength scores to produce a
           composite "buying intent score" separate from the ML model score,
           providing a second prioritization signal.

--------------------------------------------------------------------------------
6.4 ML Lead Scoring Module
--------------------------------------------------------------------------------

  FR-401 : System SHALL assign each lead a numeric score from 0.00 to 100.00
           representing predicted conversion probability (scaled).

  FR-402 : System SHALL classify each lead into one of three tiers:
             HOT   : score >= 70
             WARM  : score 40–69
             COLD  : score < 40

  FR-403 : Scoring SHALL use a trained ML model (see Section 9 for details).
           Default model: Gradient Boosting Classifier (XGBoost).
           Alternative model: Logistic Regression (explainable baseline).

  FR-404 : All 100+ features used in scoring SHALL be documented in the
           feature registry. Feature importance scores SHALL be visible
           to RevOps users.

  FR-405 : System SHALL support A/B testing between two model versions on
           live traffic with configurable traffic split.

  FR-406 : Scores SHALL be recalculated automatically:
             - Immediately upon initial enrichment completion
             - Every 24 hours based on new signal data
             - Immediately upon manual re-score request

--------------------------------------------------------------------------------
6.5 AI Insight Generation
--------------------------------------------------------------------------------

  FR-501 : For each lead with score >= 50, system SHALL generate a
           3–5 sentence AI insight explaining:
             (a) Why the lead is scored at this level
             (b) The most relevant buying signals detected
             (c) Recommended conversation angle for the sales rep

  FR-502 : Insights SHALL be generated using an LLM (Claude / GPT-4)
           via the AI Research Agent, using enriched data and signals as
           context.

  FR-503 : Insights SHALL be regenerated whenever the lead score changes
           by more than 10 points.

  FR-504 : System SHALL clearly label AI-generated content to distinguish
           it from factual enrichment data.

--------------------------------------------------------------------------------
6.6 AI Email Generation
--------------------------------------------------------------------------------

  FR-601 : System SHALL generate a personalized outreach email draft for
           each lead, consisting of:
             - Subject line (A/B variant options)
             - Email body (3–5 sentences, personalized to signals)
             - Call-to-action (meeting booking link placeholder)

  FR-602 : Email tone SHALL be configurable per workspace:
             Options: Professional | Conversational | Direct | Educational

  FR-603 : Email drafts SHALL be editable inline in the UI before sending.
           System SHALL NOT send emails — it produces drafts only (v1).

  FR-604 : System SHALL track which email templates are edited before use,
           to measure AI draft quality over time.

--------------------------------------------------------------------------------
6.7 Dashboard & UI
--------------------------------------------------------------------------------

  FR-701 : Dashboard home page SHALL display:
             - Today's top 10 prioritized leads with score and tier badge
             - Summary cards: Total Leads, Hot Leads, Avg Score, Meetings Booked
             - Activity feed: recent score changes, new signals detected
             - Score distribution histogram

  FR-702 : Leads table SHALL support:
             - Pagination (25 / 50 / 100 per page)
             - Sort by: score, company, date added, last activity
             - Filter by: tier, industry, company size, lead source, date range
             - Column customization (show/hide)
             - Bulk actions: export, re-score, assign to rep, archive

  FR-703 : Lead detail page SHALL show:
             - Full enrichment data (all fields, with source)
             - Score history chart (last 30 days)
             - All detected signals (sorted by strength)
             - AI insight block
             - AI email draft (editable)
             - Sales activity log (call notes, outcomes)
             - "Similar Leads" panel (top 5 most similar scored leads)

  FR-704 : Model Performance page SHALL display:
             - AUC-ROC curve chart
             - Precision / Recall curves
             - Feature importance bar chart (top 20 features)
             - Score distribution over time
             - Conversion rate by tier (Hot / Warm / Cold actual outcomes)
             - A/B test results (if active)

  FR-705 : Settings page SHALL include:
             - Workspace configuration (name, logo, timezone)
             - Team member management (invite, assign roles, deactivate)
             - API key management (enrichment sources)
             - Scoring thresholds (customize Hot / Warm / Cold boundaries)
             - Email template configuration
             - CRM integration setup (HubSpot, Salesforce webhook URLs)
             - Enrichment source toggles (enable/disable per source)

--------------------------------------------------------------------------------
6.8 Sales Activity Tracking
--------------------------------------------------------------------------------

  FR-801 : System SHALL allow reps to log the following activity types
           on any lead:
             - Called (answered / not answered / voicemail)
             - Emailed (sent / opened / replied)
             - Meeting booked
             - Qualified (marked as SQL)
             - Disqualified (with reason: bad fit / no budget / wrong contact
               / timing / competitor / other)
             - Converted (marked as won)

  FR-802 : System SHALL use disqualification and conversion outcomes as
           feedback labels for ML model retraining.

  FR-803 : Activity log SHALL be append-only (immutable history).
           Each entry SHALL record: user, activity_type, outcome, notes,
           timestamp.

--------------------------------------------------------------------------------
6.9 Export & Integration
--------------------------------------------------------------------------------

  FR-901 : System SHALL support CSV export of:
             - Filtered lead list (all visible columns)
             - Full enrichment data export
             - Scored lead export with all features

  FR-902 : System SHALL provide outbound webhook on lead score change for
           CRM push integration.

  FR-903 : System SHALL provide API endpoints for all core data objects
           (see Section 11 for full API spec).


================================================================================
SECTION 7 — NON-FUNCTIONAL REQUIREMENTS
================================================================================

--------------------------------------------------------------------------------
7.1 Performance
--------------------------------------------------------------------------------

  NFR-P01 : Lead enrichment pipeline SHALL complete within 120 seconds per
            lead under normal conditions (all sources responding).

  NFR-P02 : ML scoring SHALL complete within 2 seconds per lead.

  NFR-P03 : Dashboard page load (initial) SHALL be under 2 seconds on a
            standard broadband connection.

  NFR-P04 : Leads table SHALL render 100-row pages in under 500ms.

  NFR-P05 : API endpoints SHALL respond within 200ms at p95 for GET
            requests not requiring background processing.

  NFR-P06 : System SHALL support concurrent enrichment of 1,000 leads via
            queue-based background processing (see Section 8 for queue
            architecture).

--------------------------------------------------------------------------------
7.2 Availability & Reliability
--------------------------------------------------------------------------------

  NFR-A01 : System SHALL target 99.9% uptime for API and dashboard (SLA).

  NFR-A02 : Background enrichment workers SHALL be fault-tolerant. Failed
            enrichment jobs SHALL be retried up to 3 times with exponential
            backoff before being placed in a dead-letter queue.

  NFR-A03 : External API failures (enrichment sources) SHALL NOT block
            the lead scoring pipeline. System SHALL score with partial data.

  NFR-A04 : Database connection pooling SHALL handle burst traffic without
            degradation.

--------------------------------------------------------------------------------
7.3 Scalability
--------------------------------------------------------------------------------

  NFR-S01 : System SHALL be designed to handle 1,000 lead ingestions per
            minute via horizontal scaling of worker processes.

  NFR-S02 : Queue architecture (Redis / Supabase Realtime) SHALL decouple
            ingestion from enrichment and scoring.

  NFR-S03 : Database queries on leads table SHALL be performant up to
            10 million lead records via proper indexing.

  NFR-S04 : ML scoring SHALL be horizontally scalable (stateless model
            serving via REST).

--------------------------------------------------------------------------------
7.4 Security
--------------------------------------------------------------------------------

  NFR-SEC01 : All API communication SHALL use HTTPS (TLS 1.2+).

  NFR-SEC02 : User authentication SHALL use Supabase Auth (JWT-based,
              bcrypt password hashing).

  NFR-SEC03 : Third-party API keys SHALL be stored encrypted at rest
              (AES-256) and never returned in API responses.

  NFR-SEC04 : Role-based access control SHALL be enforced at the API layer.
              Roles: Admin / Manager / Rep.

  NFR-SEC05 : All API endpoints SHALL implement rate limiting:
              - Public endpoints: 60 req/min per IP
              - Authenticated endpoints: 600 req/min per user
              - Bulk operations: 10 req/min per user

  NFR-SEC06 : PII (email addresses, personal names) SHALL be handled in
              compliance with GDPR and CCPA. Users SHALL be able to request
              deletion of a lead record.

  NFR-SEC07 : All database rows SHALL include tenant isolation via
              organization_id (multi-tenancy).

--------------------------------------------------------------------------------
7.5 Maintainability
--------------------------------------------------------------------------------

  NFR-M01 : All enrichment tools SHALL be modular and independently
            testable Python scripts.

  NFR-M02 : ML model artifacts SHALL be versioned and stored in object
            storage. Model rollback SHALL be achievable in under 5 minutes.

  NFR-M03 : System SHALL emit structured logs for all pipeline stages
            (JSON format, to stdout, consumed by log aggregator).

  NFR-M04 : All configuration (thresholds, model paths, API endpoints)
            SHALL be externalized to environment variables.


================================================================================
SECTION 8 — SYSTEM ARCHITECTURE (WAT FRAMEWORK)
================================================================================

--------------------------------------------------------------------------------
8.1 WAT Framework Overview
--------------------------------------------------------------------------------

The system is built on the WAT (Workflows, Agents, Tools) architecture,
a three-layer design pattern that separates declarative process knowledge,
intelligent orchestration, and deterministic execution.

  +-------------------------------------------------------------+
  |                    LAYER 1 — WORKFLOWS                      |
  |  Markdown SOP files describing tasks, decision rules,       |
  |  enrichment sequences, scoring criteria, and output formats |
  +-------------------------------------------------------------+
                              |
                              | (read at runtime)
                              v
  +-------------------------------------------------------------+
  |                     LAYER 2 — AGENTS                        |
  |  LLM-powered orchestrators that read workflows and decide   |
  |  which tools to call, in what order, with what parameters   |
  +-------------------------------------------------------------+
                              |
                              | (invoke)
                              v
  +-------------------------------------------------------------+
  |                      LAYER 3 — TOOLS                        |
  |  Deterministic Python scripts that execute specific tasks:  |
  |  API calls, scraping, ML inference, data transformation     |
  +-------------------------------------------------------------+

--------------------------------------------------------------------------------
8.2 Layer 1 — Workflows (Markdown SOP Files)
--------------------------------------------------------------------------------

Workflows are plain Markdown files stored in the /workflows directory.
They serve as the "brain specification" for each agent — telling the agent
what steps to follow, what conditions to check, and what outcomes to produce.

Workflow files are loaded by agents at runtime using a simple file reader
tool. This means workflows can be updated without redeploying code.

Example workflow files:

  workflows/
    lead_enrichment.md          — enrichment sequence and source priority
    signal_detection.md         — which signals to detect and how
    lead_scoring.md             — scoring logic and feature selection
    email_generation.md         — email drafting rules and tone guidance
    lead_research.md            — deep research procedure for hot leads

Sample workflow excerpt (lead_enrichment.md):

  ---
  WORKFLOW: Lead Enrichment
  VERSION: 1.2
  TRIGGER: New lead ingested
  ---

  ## Steps

  1. Extract company domain from email or website field.
  2. Call Clearbit Enrichment API with domain.
     - If 200 OK: store company_size, industry, funding.
     - If 404 or error: proceed to fallback.
  3. Fallback: Scrape company LinkedIn page for headcount, description.
  4. Call Hunter.io to verify email deliverability.
  5. Query Crunchbase API for funding data if not found in step 2.
  6. Detect signals per signal_detection workflow.
  7. Mark enrichment_status = COMPLETE or PARTIAL.
  8. Trigger scoring pipeline.
  ---

--------------------------------------------------------------------------------
8.3 Layer 2 — Agents
--------------------------------------------------------------------------------

Agents are Python classes that wrap an LLM (Claude Sonnet or GPT-4o)
and implement the ReAct (Reasoning + Acting) pattern.

Each agent:
  1. Loads its assigned workflow Markdown file
  2. Reads the current lead context (JSON)
  3. Reasons about which tools to call
  4. Calls tools sequentially or in parallel
  5. Synthesizes results into a structured output

Agents in the system:

  AGENT-01: LeadEnrichmentAgent
    - Workflow : lead_enrichment.md
    - Tools    : ClearbitTool, HunterTool, LinkedInScraperTool,
                 CrunchbaseTool, EmailValidationTool
    - Output   : enriched lead JSON

  AGENT-02: SignalDetectionAgent
    - Workflow : signal_detection.md
    - Tools    : NewsAPITool, LinkedInJobsTool, TechStackDetectorTool,
                 FundingNewsTool
    - Output   : list of detected signals with strength scores

  AGENT-03: LeadResearchAgent
    - Workflow : lead_research.md
    - Tools    : WebSearchTool, WebScraperTool, NewsAPITool
    - Output   : AI insight paragraph (3–5 sentences)

  AGENT-04: EmailGenerationAgent
    - Workflow : email_generation.md
    - Tools    : TemplateLoaderTool, LLMGenerationTool
    - Output   : personalized email subject + body

  AGENT-05: ScoringOrchestrationAgent
    - Workflow : lead_scoring.md
    - Tools    : FeatureExtractorTool, MLScoringTool, TierClassifierTool
    - Output   : lead_score (0–100), tier (Hot/Warm/Cold), feature vector

--------------------------------------------------------------------------------
8.4 Layer 3 — Tools
--------------------------------------------------------------------------------

Tools are deterministic Python functions decorated with a standard interface:
  - Input: typed Pydantic model
  - Output: typed Pydantic model or raises ToolException
  - Logging: all calls logged with duration, status, cost
  - Caching: results cached in Redis with configurable TTL

Tool inventory:

  DATA INGESTION TOOLS
    ClearbitEnrichmentTool     — company + person data from Clearbit API
    HunterEmailTool            — email verification and company search
    CrunchbaseSearchTool       — funding, investor, founding data
    LinkedInScraperTool        — headcount, description, job posts
    TechStackDetectorTool      — BuiltWith / Wappalyzer API integration
    NewsAPITool                — recent company news articles
    LinkedInJobsTool           — open job listings count and titles

  ML TOOLS
    FeatureExtractorTool       — converts enriched lead JSON to ML feature vector
    MLScoringTool              — calls ML model API endpoint, returns score
    TierClassifierTool         — maps score to Hot/Warm/Cold using thresholds
    ModelABTestRouter          — routes scoring requests to model A or B

  AI TOOLS
    LLMInsightTool             — calls LLM to generate insight paragraph
    LLMEmailTool               — calls LLM to generate email draft
    WorkflowLoaderTool         — reads Markdown workflow file from disk

  UTILITY TOOLS
    EmailValidationTool        — syntax + MX record email validation
    DomainExtractorTool        — extracts company domain from email/URL
    DataNormalizationTool      — standardizes field formats (phone, country)
    CacheReadTool              — reads cached enrichment result from Redis
    CacheWriteTool             — writes enrichment result to Redis cache

--------------------------------------------------------------------------------
8.5 Backend Service Architecture
--------------------------------------------------------------------------------

  +-------------------+       +-------------------+       +-----------------+
  |   FastAPI Server  |       |   Background Queue|       |  ML Model Server|
  |                   |       |   (Redis / ARQ)   |       |  (FastAPI)      |
  |  REST API Layer   +------>|   Worker Processes+------>|  /predict       |
  |  Auth Middleware  |       |   Enrichment Jobs |       |  XGBoost Model  |
  |  Rate Limiter     |       |   Scoring Jobs    |       |  Feature Scaler |
  +--------+----------+       +-------------------+       +-----------------+
           |
           v
  +-------------------+
  |   Supabase        |
  |   - PostgreSQL DB |
  |   - Auth (JWT)    |
  |   - Realtime WS   |
  |   - Storage       |
  +-------------------+

  Service boundaries:
    api/           — FastAPI application (routes, middleware, dependencies)
    workers/       — Background job processors (ARQ or Celery)
    agents/        — Agent class implementations
    tools/         — Tool implementations (one file per tool)
    workflows/     — Markdown workflow SOP files
    ml/            — Model training, evaluation, serving scripts
    models/        — Pydantic data models
    db/            — Database access layer (Supabase client wrappers)


================================================================================
SECTION 9 — AI ARCHITECTURE
================================================================================

--------------------------------------------------------------------------------
9.1 ML Lead Scoring Model
--------------------------------------------------------------------------------

OBJECTIVE:
  Binary classification — predict whether a lead will convert to a
  sales-qualified opportunity within 90 days.

  Label: converted_90d (1 = SQL within 90 days, 0 = not converted)

FEATURE CATEGORIES (total ~80–120 features):

  Firmographic Features (company-level):
    - company_size_bucket (0–10, 11–50, 51–200, 201–500, 500+)
    - industry_encoded (one-hot, top 20 industries)
    - company_age_years
    - hq_country_encoded
    - hq_us_state_encoded
    - total_funding_usd (log-scaled)
    - last_funding_days_ago
    - last_funding_type_encoded (Seed/A/B/C/PE/None)
    - employee_growth_6m_pct
    - glassdoor_rating
    - linkedin_followers_count (log-scaled)
    - linkedin_follower_growth_30d

  Person-Level Features:
    - seniority_level_encoded (IC / Manager / Director / VP / C-Suite)
    - is_decision_maker (boolean)
    - tenure_in_role_months
    - email_is_professional (boolean)
    - email_domain_match_company (boolean)

  Behavioral Features (from CRM):
    - lead_source_encoded (organic / paid / referral / event / cold)
    - utm_campaign_encoded
    - page_views_before_lead (if available)
    - content_downloaded (boolean)
    - pricing_page_visited (boolean)
    - demo_requested (boolean)

  Signal Features:
    - signal_funding_present (boolean)
    - signal_funding_strength (0–10)
    - signal_hiring_present (boolean)
    - signal_hiring_count (number of open roles)
    - signal_hiring_sales_roles (boolean)
    - signal_tech_adopt_present (boolean)
    - signal_executive_change (boolean)
    - composite_signal_score (sum of weighted signals)

  Derived Features:
    - icp_fit_score (computed: how closely matches Ideal Customer Profile)
    - enrichment_completeness_pct (% of fields successfully enriched)
    - days_since_lead_created
    - hour_of_day_submitted (submission timing signal)

MODEL SELECTION:

  Primary model   : XGBoost Gradient Boosted Trees
    - Handles mixed numeric/categorical features natively
    - Excellent performance on tabular data
    - Built-in feature importance
    - Fast inference (< 10ms per prediction)

  Explainability  : SHAP (SHapley Additive exPlanations)
    - Per-prediction feature contribution scores
    - Used to generate human-readable insight text

  Baseline model  : Logistic Regression (L2 regularized)
    - Used in A/B test as interpretable comparison
    - Coefficient magnitudes directly interpretable

  Alternative     : LightGBM (evaluated in training, kept as backup)

TRAINING PIPELINE:

  Step 1 — Data Collection
    - Historical leads from CRM export (minimum 5,000 labeled records)
    - Label: converted_90d (joined to deal records)
    - Enrichment features fetched for all historical leads

  Step 2 — Feature Engineering
    - Categorical encoding (target encoding for high-cardinality)
    - Log transformation for skewed numeric features
    - Imputation strategy: median for numerics, "unknown" for categoricals
    - Feature selection: remove features with > 70% missing rate

  Step 3 — Train/Validation/Test Split
    - Time-based split (not random): train on months 1–18, validate 19–21,
      test 22–24
    - Prevents data leakage from future events

  Step 4 — Training
    - XGBoost with early stopping on validation AUC
    - Hyperparameter tuning: Optuna with 100 trials
    - Class imbalance handling: scale_pos_weight or SMOTE oversampling

  Step 5 — Evaluation (on held-out test set)
    - Primary: AUC-ROC (target: > 0.75)
    - Secondary: Precision at Top-10% leads (target: > 50%)
    - Secondary: Recall (target: > 60%)
    - Calibration: Brier Score (predicted probabilities should be well-calibrated)

  Step 6 — Model Artifacts
    - model.pkl (serialized XGBoost model)
    - scaler.pkl (feature scaler)
    - feature_names.json (ordered list of 120 features)
    - thresholds.json (Hot/Warm/Cold boundary scores)
    - shap_explainer.pkl (SHAP TreeExplainer)
    - All stored in Supabase Storage with version tag

A/B TESTING:

  - ModelABTestRouter tool routes X% of scoring requests to model_v2
    and (100-X)% to model_v1 (default 10% / 90%)
  - model_version field stored on each lead_score record
  - A/B results visible on Model Performance dashboard
  - Evaluation: Conversion rate by model version (2-week minimum test window)
  - Statistical significance test: Chi-squared, p < 0.05 threshold

--------------------------------------------------------------------------------
9.2 AI Lead Research Agent (LeadResearchAgent)
--------------------------------------------------------------------------------

This agent performs deep research on high-priority leads (score >= 70)
to generate the insight paragraph displayed in the UI.

PROCESS:
  1. Load lead context (enriched data + signals)
  2. Construct a research prompt including:
       - Company name, size, industry, funding stage
       - List of detected signals and their descriptions
       - Rep's product category (for relevance framing)
  3. Optionally call WebSearchTool for recent news (if last_news_check > 7 days)
  4. Send structured prompt to LLM (Claude Sonnet)
  5. Parse response into: reason_hot, signals_summary, conversation_angle
  6. Store in lead record, display in UI

PROMPT TEMPLATE:

  You are a sales intelligence analyst. Given the following lead data,
  write a 3-sentence insight that:
    (1) Explains in one sentence why this lead is prioritized
    (2) Names the most compelling buying signal with specifics
    (3) Suggests one specific conversation opener for the sales rep

  Lead data: {lead_json}
  Signals: {signals_list}
  Product context: {workspace_product_description}

  Respond in JSON: {"reason": "...", "signal": "...", "opener": "..."}

--------------------------------------------------------------------------------
9.3 AI Email Generation Agent
--------------------------------------------------------------------------------

PROCESS:
  1. Load lead data, signals, insight, workspace email settings
  2. Select appropriate template tone (Professional / Conversational / etc.)
  3. Call LLMEmailTool with structured prompt
  4. Parse response into: subject_line, body, cta_text
  5. Return draft for UI display

EMAIL QUALITY GUARDRAILS:
  - Max body length: 150 words
  - Must reference at least one specific company data point
  - Must include a single clear call-to-action
  - No generic phrases: "I hope this email finds you well", "touching base"
  - Subject line A/B: generate 2 variants, both shown to rep

--------------------------------------------------------------------------------
9.4 SHAP Explanation System
--------------------------------------------------------------------------------

After ML scoring, SHAP values are computed per lead:

  shap_values = shap_explainer.shap_values(feature_vector)
  top_features = sort_by_abs_shap(shap_values)[:5]

The top 5 features driving the score (positive and negative) are:
  1. Stored in the lead_scores table as JSON
  2. Used to populate the AI insight prompt (contextual grounding)
  3. Displayed as feature contribution bars in Lead Detail UI

This provides full model explainability without requiring users to
understand SHAP — the AI insight agent translates them to natural language.


================================================================================
SECTION 10 — DATABASE SCHEMA
================================================================================

Database: PostgreSQL via Supabase
Multi-tenancy: All tables include organization_id for tenant isolation
UUID primary keys throughout for security and distributed system compatibility

--------------------------------------------------------------------------------
Table: organizations
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  name                  TEXT          NOT NULL
  domain                TEXT          UNIQUE
  plan_tier             TEXT          DEFAULT 'free'  -- free/pro/enterprise
  max_leads             INTEGER       DEFAULT 500
  settings              JSONB         DEFAULT '{}'
  created_at            TIMESTAMPTZ   DEFAULT NOW()
  updated_at            TIMESTAMPTZ   DEFAULT NOW()

--------------------------------------------------------------------------------
Table: users
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY REFERENCES auth.users
  organization_id       UUID          REFERENCES organizations(id) NOT NULL
  email                 TEXT          NOT NULL UNIQUE
  full_name             TEXT
  role                  TEXT          DEFAULT 'rep'  -- admin/manager/rep
  avatar_url            TEXT
  is_active             BOOLEAN       DEFAULT TRUE
  last_login_at         TIMESTAMPTZ
  created_at            TIMESTAMPTZ   DEFAULT NOW()
  updated_at            TIMESTAMPTZ   DEFAULT NOW()

  INDEXES: (organization_id), (email)

--------------------------------------------------------------------------------
Table: leads
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  organization_id       UUID          REFERENCES organizations(id) NOT NULL
  assigned_to           UUID          REFERENCES users(id)

  -- Core identity
  first_name            TEXT          NOT NULL
  last_name             TEXT          NOT NULL
  email                 TEXT          NOT NULL
  phone                 TEXT
  title                 TEXT
  linkedin_url          TEXT
  seniority_level       TEXT          -- IC/Manager/Director/VP/C-Suite

  -- Company info (raw, at ingestion time)
  company               TEXT          NOT NULL
  company_website       TEXT
  industry              TEXT
  location              TEXT

  -- Lead metadata
  lead_source           TEXT          -- organic/paid/referral/event/cold/import
  utm_source            TEXT
  utm_campaign          TEXT
  lead_status           TEXT          DEFAULT 'new'
                                      -- new/enriching/scored/contacted/
                                      --    qualified/disqualified/converted
  tier                  TEXT          -- Hot/Warm/Cold (set by scoring)
  current_score         DECIMAL(5,2)  -- 0.00 to 100.00 (latest ML score)
  buying_intent_score   DECIMAL(5,2)  -- 0.00 to 100.00 (signal composite)

  -- Pipeline
  enrichment_status     TEXT          DEFAULT 'pending'
                                      -- pending/in_progress/complete/partial/failed
  last_enriched_at      TIMESTAMPTZ
  last_scored_at        TIMESTAMPTZ

  -- Deduplication
  is_duplicate          BOOLEAN       DEFAULT FALSE
  duplicate_of          UUID          REFERENCES leads(id)

  created_at            TIMESTAMPTZ   DEFAULT NOW()
  updated_at            TIMESTAMPTZ   DEFAULT NOW()

  UNIQUE: (organization_id, email)
  INDEXES: (organization_id), (tier), (current_score DESC),
           (enrichment_status), (lead_status), (assigned_to)

--------------------------------------------------------------------------------
Table: lead_enrichment
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  lead_id               UUID          REFERENCES leads(id) NOT NULL
  organization_id       UUID          REFERENCES organizations(id) NOT NULL

  -- Company enrichment
  company_name_verified TEXT
  company_domain        TEXT
  company_description   TEXT
  company_size          INTEGER       -- actual headcount
  company_size_bucket   TEXT          -- 1-10/11-50/51-200/201-500/500+
  company_founded_year  INTEGER
  company_hq_city       TEXT
  company_hq_country    TEXT
  company_linkedin_url  TEXT
  company_linkedin_followers INTEGER
  company_glassdoor_rating DECIMAL(3,1)

  -- Funding
  total_funding_usd     BIGINT
  last_funding_type     TEXT          -- Seed/Series-A/B/C/PE/Grant/None
  last_funding_amount   BIGINT
  last_funding_date     DATE
  last_funding_investors TEXT[]       -- array of investor names

  -- Technology
  tech_stack            TEXT[]        -- detected technologies
  crm_detected          TEXT
  marketing_tools       TEXT[]

  -- Person enrichment
  email_verified        BOOLEAN
  email_deliverable     BOOLEAN
  is_decision_maker     BOOLEAN
  tenure_months         INTEGER

  -- Growth signals
  employee_growth_6m_pct DECIMAL(5,2)
  linkedin_follower_growth_30d DECIMAL(5,2)

  -- Source attribution
  enrichment_sources    JSONB         -- {clearbit: {...}, crunchbase: {...}}
  enrichment_completeness_pct DECIMAL(5,2)

  created_at            TIMESTAMPTZ   DEFAULT NOW()
  updated_at            TIMESTAMPTZ   DEFAULT NOW()

  UNIQUE: (lead_id)
  INDEXES: (organization_id), (lead_id)

--------------------------------------------------------------------------------
Table: lead_signals
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  lead_id               UUID          REFERENCES leads(id) NOT NULL
  organization_id       UUID          REFERENCES organizations(id) NOT NULL

  signal_type           TEXT          NOT NULL
                                      -- SIGNAL_FUNDING / SIGNAL_HIRING /
                                      --   SIGNAL_GROWTH / SIGNAL_TECH_ADOPT /
                                      --   SIGNAL_EXECUTIVE / SIGNAL_EXPANSION /
                                      --   SIGNAL_CONTENT / SIGNAL_AWARD / SIGNAL_IPO
  signal_strength       SMALLINT      CHECK (signal_strength BETWEEN 1 AND 10)
  signal_date           DATE          -- when the signal event occurred
  signal_source         TEXT          -- URL or API name
  signal_description    TEXT          -- human-readable: "Raised $20M Series B on Jan 5"
  is_active             BOOLEAN       DEFAULT TRUE  -- set to FALSE when signal expires
  expires_at            TIMESTAMPTZ   -- signals expire (e.g. funding signal after 90 days)

  created_at            TIMESTAMPTZ   DEFAULT NOW()

  INDEXES: (lead_id), (organization_id, signal_type), (signal_strength DESC)

--------------------------------------------------------------------------------
Table: lead_scores
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  lead_id               UUID          REFERENCES leads(id) NOT NULL
  organization_id       UUID          REFERENCES organizations(id) NOT NULL

  score                 DECIMAL(5,2)  NOT NULL    -- 0.00 to 100.00
  tier                  TEXT          NOT NULL    -- Hot/Warm/Cold
  model_version         TEXT          NOT NULL    -- e.g. "xgboost_v2.1"
  model_variant         TEXT          DEFAULT 'A' -- A/B test variant
  feature_vector        JSONB         NOT NULL    -- all features used
  shap_values           JSONB                     -- top 5 SHAP contributions
  score_explanation     TEXT                      -- AI-generated explanation

  scored_at             TIMESTAMPTZ   DEFAULT NOW()

  INDEXES: (lead_id), (organization_id), (scored_at DESC)
  NOTE: Append-only table. Latest record per lead_id = current score.

--------------------------------------------------------------------------------
Table: lead_ai_content
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  lead_id               UUID          REFERENCES leads(id) NOT NULL
  organization_id       UUID          REFERENCES organizations(id) NOT NULL

  -- Insight
  insight_text          TEXT          -- full AI insight paragraph
  insight_reason        TEXT          -- why this lead is hot
  insight_signal        TEXT          -- most compelling signal summary
  insight_opener        TEXT          -- suggested conversation opener

  -- Email draft
  email_subject_a       TEXT          -- subject line variant A
  email_subject_b       TEXT          -- subject line variant B
  email_body            TEXT          -- email body draft
  email_tone            TEXT          -- tone used for generation

  -- Metadata
  llm_model_used        TEXT          -- claude-3-sonnet / gpt-4o
  was_email_edited      BOOLEAN       DEFAULT FALSE
  generated_at          TIMESTAMPTZ   DEFAULT NOW()

  UNIQUE: (lead_id)  -- one active AI content record per lead

--------------------------------------------------------------------------------
Table: sales_activity
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  lead_id               UUID          REFERENCES leads(id) NOT NULL
  organization_id       UUID          REFERENCES organizations(id) NOT NULL
  user_id               UUID          REFERENCES users(id) NOT NULL

  activity_type         TEXT          NOT NULL
                                      -- called/emailed/meeting_booked/
                                      --   qualified/disqualified/converted
  outcome               TEXT
                                      -- answered/not_answered/voicemail/
                                      --   sent/opened/replied/booked/
                                      --   bad_fit/no_budget/wrong_contact/
                                      --   timing/competitor/won/other
  notes                 TEXT
  duration_seconds      INTEGER       -- for calls

  created_at            TIMESTAMPTZ   DEFAULT NOW()

  INDEXES: (lead_id), (organization_id), (user_id), (activity_type),
           (created_at DESC)
  NOTE: Append-only activity log. No updates allowed.

--------------------------------------------------------------------------------
Table: enrichment_jobs
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  lead_id               UUID          REFERENCES leads(id) NOT NULL
  organization_id       UUID          REFERENCES organizations(id) NOT NULL

  job_type              TEXT          NOT NULL  -- enrich/score/research/email
  status                TEXT          DEFAULT 'queued'
                                      -- queued/running/complete/failed/dead_letter
  attempts              SMALLINT      DEFAULT 0
  last_error            TEXT
  started_at            TIMESTAMPTZ
  completed_at          TIMESTAMPTZ
  created_at            TIMESTAMPTZ   DEFAULT NOW()

  INDEXES: (status), (lead_id), (created_at)

--------------------------------------------------------------------------------
Table: api_keys
--------------------------------------------------------------------------------
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  organization_id       UUID          REFERENCES organizations(id) NOT NULL
  key_name              TEXT          NOT NULL    -- e.g. "clearbit", "hunter"
  encrypted_value       TEXT          NOT NULL    -- AES-256 encrypted
  is_active             BOOLEAN       DEFAULT TRUE
  last_used_at          TIMESTAMPTZ
  created_by            UUID          REFERENCES users(id)
  created_at            TIMESTAMPTZ   DEFAULT NOW()

  UNIQUE: (organization_id, key_name)


================================================================================
SECTION 11 — API DESIGN
================================================================================

Base URL: https://api.leadintel.io/v1
Auth: Bearer token (JWT from Supabase Auth) in Authorization header
Content-Type: application/json
API versioning: URL path (/v1/)

--------------------------------------------------------------------------------
11.1 Lead Endpoints
--------------------------------------------------------------------------------

POST /leads
  Description : Ingest one or more new leads
  Auth        : Required (rep role or above)
  Request Body:
    {
      "leads": [
        {
          "first_name": "string (required)",
          "last_name": "string (required)",
          "email": "string (required, valid email)",
          "company": "string (required)",
          "company_website": "string (optional)",
          "title": "string (optional)",
          "phone": "string (optional)",
          "industry": "string (optional)",
          "location": "string (optional)",
          "linkedin_url": "string (optional)",
          "lead_source": "string (optional)",
          "utm_source": "string (optional)"
        }
      ],
      "auto_enrich": true
    }
  Response 201:
    {
      "created": 45,
      "updated": 3,
      "skipped": 2,
      "errors": [],
      "job_ids": ["uuid", "uuid"],
      "estimated_completion_seconds": 120
    }
  Response 400: Validation errors (invalid emails, missing required fields)
  Response 429: Rate limit exceeded

GET /leads
  Description : Retrieve paginated, filtered, sorted lead list
  Auth        : Required
  Query Params:
    page          integer (default: 1)
    per_page      integer (default: 25, max: 100)
    sort_by       string (score|company|created_at|last_activity_at)
    sort_order    string (asc|desc, default: desc)
    tier          string (Hot|Warm|Cold)
    status        string (new|enriching|scored|contacted|qualified|etc.)
    industry      string
    company_size  string (1-10|11-50|51-200|201-500|500+)
    lead_source   string
    assigned_to   uuid
    date_from     ISO8601 date
    date_to       ISO8601 date
    search        string (searches name, email, company)
  Response 200:
    {
      "data": [
        {
          "id": "uuid",
          "full_name": "Jane Smith",
          "email": "jane@acmecorp.com",
          "company": "Acme Corp",
          "title": "VP of Sales",
          "current_score": 82.5,
          "tier": "Hot",
          "lead_status": "scored",
          "enrichment_status": "complete",
          "top_signal": "Raised $15M Series B (Jan 2025)",
          "assigned_to_name": "Alex Chen",
          "created_at": "2025-01-15T10:00:00Z",
          "last_scored_at": "2025-01-16T08:00:00Z"
        }
      ],
      "meta": {
        "total": 1847,
        "page": 1,
        "per_page": 25,
        "total_pages": 74
      }
    }

GET /leads/{id}
  Description : Get full lead detail with enrichment, signals, scores, activity
  Auth        : Required
  Response 200:
    {
      "id": "uuid",
      "basic": { ... all leads table fields ... },
      "enrichment": { ... all lead_enrichment fields ... },
      "signals": [
        {
          "signal_type": "SIGNAL_FUNDING",
          "signal_strength": 9,
          "signal_date": "2025-01-05",
          "signal_description": "Raised $20M Series B",
          "signal_source": "https://techcrunch.com/..."
        }
      ],
      "latest_score": {
        "score": 82.5,
        "tier": "Hot",
        "model_version": "xgboost_v2.1",
        "shap_top_features": [
          {"feature": "signal_funding_present", "contribution": +12.3},
          {"feature": "company_size_bucket_51-200", "contribution": +8.1},
          {"feature": "is_decision_maker", "contribution": +6.7}
        ],
        "scored_at": "2025-01-16T08:00:00Z"
      },
      "score_history": [
        {"score": 82.5, "scored_at": "2025-01-16"},
        {"score": 61.0, "scored_at": "2025-01-10"}
      ],
      "ai_content": {
        "insight_text": "...",
        "insight_opener": "...",
        "email_subject_a": "...",
        "email_body": "..."
      },
      "activity": [ ... last 20 sales_activity records ... ]
    }
  Response 404: Lead not found

PATCH /leads/{id}
  Description : Update lead fields (status, assignment, manual overrides)
  Auth        : Required (manager or above for assignment changes)
  Request Body: Any subset of mutable lead fields
  Response 200: Updated lead object

DELETE /leads/{id}
  Description : Archive lead (soft delete, GDPR erasure path)
  Auth        : Required (admin only)
  Response 204: No content

POST /leads/{id}/activities
  Description : Log a sales activity on a lead
  Auth        : Required
  Request Body:
    {
      "activity_type": "called",
      "outcome": "not_answered",
      "notes": "Tried mobile number, no answer",
      "duration_seconds": 45
    }
  Response 201: Created activity record

GET /leads/{id}/activities
  Description : Get activity log for a lead
  Auth        : Required
  Response 200: Array of activity records

--------------------------------------------------------------------------------
11.2 Scoring & Pipeline Endpoints
--------------------------------------------------------------------------------

POST /leads/score
  Description : Trigger scoring for one or more leads
  Auth        : Required (manager or above)
  Request Body:
    {
      "lead_ids": ["uuid", "uuid"],
      "force_re_enrich": false,
      "model_version": "xgboost_v2.1"
    }
  Response 202:
    {
      "queued": 2,
      "job_ids": ["uuid", "uuid"],
      "message": "Scoring jobs queued"
    }

GET /leads/top
  Description : Get top N leads by score for today's prioritized list
  Auth        : Required
  Query Params:
    limit     integer (default: 20, max: 100)
    tier      string (Hot — returns only Hot leads)
    assigned_to uuid (filter to current user if not specified)
  Response 200:
    {
      "leads": [ ... top N lead summary objects with score + signals ... ],
      "generated_at": "2025-01-16T09:00:00Z"
    }

POST /leads/{id}/enrich
  Description : Trigger re-enrichment for a specific lead
  Auth        : Required
  Response 202: { "job_id": "uuid", "message": "Enrichment queued" }

GET /jobs/{job_id}
  Description : Poll enrichment / scoring job status
  Auth        : Required
  Response 200:
    {
      "id": "uuid",
      "job_type": "enrich",
      "status": "complete",
      "lead_id": "uuid",
      "completed_at": "2025-01-16T09:01:34Z"
    }

--------------------------------------------------------------------------------
11.3 Analytics & Model Endpoints
--------------------------------------------------------------------------------

GET /analytics/summary
  Description : Dashboard summary statistics
  Auth        : Required
  Response 200:
    {
      "total_leads": 1847,
      "hot_leads": 234,
      "warm_leads": 612,
      "cold_leads": 1001,
      "avg_score": 48.3,
      "meetings_booked_30d": 47,
      "conversion_rate_hot": 0.23,
      "conversion_rate_warm": 0.09,
      "conversion_rate_cold": 0.02
    }

GET /analytics/model-performance
  Description : ML model performance metrics
  Auth        : Required (manager or above)
  Response 200:
    {
      "model_version": "xgboost_v2.1",
      "auc_roc": 0.81,
      "precision_top10pct": 0.54,
      "recall": 0.67,
      "brier_score": 0.14,
      "feature_importance": [
        {"feature": "signal_funding_present", "importance": 0.142},
        ...
      ],
      "ab_test": {
        "active": true,
        "model_a": "xgboost_v2.1",
        "model_b": "xgboost_v2.2",
        "traffic_split": 0.1,
        "model_a_conversion_rate": 0.18,
        "model_b_conversion_rate": 0.21,
        "statistical_significance": false
      }
    }

--------------------------------------------------------------------------------
11.4 Organization & User Endpoints
--------------------------------------------------------------------------------

GET /organization
  Description : Get current organization settings
  Auth        : Required (admin)

PATCH /organization
  Description : Update organization settings
  Auth        : Required (admin)

GET /users
  Description : List team members
  Auth        : Required (manager or above)

POST /users/invite
  Description : Invite team member by email
  Auth        : Required (admin)
  Request Body: { "email": "...", "role": "rep" }

PATCH /users/{id}
  Description : Update user role or deactivate
  Auth        : Required (admin)

POST /api-keys
  Description : Store encrypted API key for enrichment source
  Auth        : Required (admin)
  Request Body: { "key_name": "clearbit", "value": "sk_..." }

POST /leads/export
  Description : Generate CSV export of filtered leads
  Auth        : Required
  Request Body: Same filter params as GET /leads
  Response 200: CSV file (Content-Type: text/csv)


================================================================================
SECTION 12 — UI/UX DESIGN
================================================================================

Frontend Stack: Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Recharts
State Management: Zustand + React Query (TanStack Query) for server state
Auth: Supabase Auth UI components + custom JWT handling
Real-time: Supabase Realtime subscriptions for live score updates

--------------------------------------------------------------------------------
12.1 Navigation Structure
--------------------------------------------------------------------------------

  /                       — Dashboard home (redirect to /dashboard)
  /dashboard              — Main dashboard overview
  /leads                  — Leads table (full list)
  /leads/[id]             — Lead detail page
  /analytics              — Model performance & analytics
  /settings               — Workspace settings
  /settings/team          — Team management
  /settings/integrations  — CRM & API key management
  /auth/login             — Login page
  /auth/signup            — Signup / organization creation
  /onboarding             — First-run setup wizard

Sidebar navigation (persistent on all authenticated pages):
  - Logo + workspace name dropdown
  - Today's Hot Leads badge (count)
  - Dashboard
  - Leads (with total count badge)
  - Analytics
  - Settings
  - User avatar + logout

--------------------------------------------------------------------------------
12.2 Page: Dashboard Home (/dashboard)
--------------------------------------------------------------------------------

LAYOUT: 3-column grid (top summary cards) + 2-column (table + activity feed)

Top Row — Summary Cards (4 cards):
  Card 1: Total Leads (count + 30-day trend arrow)
  Card 2: Hot Leads Today (count + % of total)
  Card 3: Avg Lead Score (decimal + trend)
  Card 4: Meetings Booked This Week (from activity log)

Second Row — Priority List:
  "Your Top Leads Today" table
  Columns: Rank | Name + Company | Score badge | Tier tag | Top Signal | Actions
  - Score badge: colored circle (green=Hot, yellow=Warm, blue=Cold)
  - Top Signal: truncated signal description with icon
  - Actions: "View" button, "Log Activity" quick button
  - Row click: navigates to /leads/[id]

Third Row Left — Score Distribution:
  Histogram (Recharts BarChart) showing lead count per score band (0-10, 11-20, ...)
  Color-coded: red (Hot), yellow (Warm), blue (Cold) bands

Third Row Right — Recent Activity Feed:
  Live-updating feed (Supabase Realtime):
  - "Acme Corp score updated: 61 → 82 (Hot)"
  - "New signal: TechCorp raised $8M Series A"
  - "Alex logged: Called Dataflow Inc — Not answered"

--------------------------------------------------------------------------------
12.3 Page: Leads Table (/leads)
--------------------------------------------------------------------------------

LAYOUT: Full-width table with filter sidebar (collapsible)

Filter Panel (left sidebar):
  - Search bar (name / email / company)
  - Tier filter (Hot / Warm / Cold checkboxes)
  - Status filter (multi-select)
  - Industry filter (multi-select, top 10 + "more")
  - Company size filter (range slider or buckets)
  - Lead source filter
  - Date added range (date picker)
  - Assigned to filter (user dropdown)
  - "Reset Filters" button

Table Columns (customizable):
  Default visible: Name | Company | Score | Tier | Lead Source | Top Signal |
                   Status | Assigned To | Date Added | Actions
  Actions column: View | Log Activity | Re-enrich | Assign

Table Features:
  - Sticky header with sort arrows on all columns
  - Row selection checkboxes for bulk operations
  - Bulk action bar (appears when rows selected):
      Export CSV | Assign to Rep | Re-score | Archive
  - Pagination controls: prev/next + page size selector
  - "Import Leads" button (opens CSV upload modal)
  - "Add Lead" button (opens single-lead form drawer)

CSV Upload Modal:
  - Drag-and-drop or file picker
  - Column mapping interface (map CSV columns to system fields)
  - Preview first 5 rows
  - "Upload & Enrich" button

--------------------------------------------------------------------------------
12.4 Page: Lead Detail (/leads/[id])
--------------------------------------------------------------------------------

LAYOUT: 2-column (main content left, sidebar right)

Header:
  - Avatar (initials) | Full Name | Title @ Company
  - Score badge (large, colored) + tier tag
  - Tier: Hot 🔥 / Warm 🌡 / Cold ❄️
  - Quick action buttons: "Log Activity" | "Re-enrich" | "Export"
  - Breadcrumb: Leads > [Company Name]

Left Column — Main Content:

  SECTION: AI Insight Card (highlighted box, top of page)
    - 🤖 icon + "AI Intelligence" header
    - Insight reason paragraph
    - Conversation opener suggestion (highlighted)
    - Signal summary
    - "Regenerate" button (re-runs AI research agent)

  SECTION: AI Email Draft
    - Subject Line (editable, with A/B variant toggle)
    - Email body (editable textarea)
    - "Copy to Clipboard" button
    - "Mark as Sent" toggle (triggers activity log)

  SECTION: Buying Signals (card list)
    Each signal card:
    - Signal type icon + name
    - Strength badge (1–10 scale, color coded)
    - Description (full text)
    - Source link (clickable)
    - Date detected
    Empty state: "No buying signals detected yet. Last checked [timestamp]"

  SECTION: Score History (chart)
    - Line chart (Recharts) showing score over time (last 90 days)
    - Annotations on chart for major signal events
    - Model version shown in legend

  SECTION: Activity Log
    - Timeline of all sales activities (append-only)
    - Each entry: timestamp, rep name, activity type icon, outcome badge, notes
    - "Add Activity" inline form at top:
        Activity type dropdown | Outcome dropdown | Notes text field | Save

Right Column — Data Sidebar:

  SECTION: Score Breakdown
    - Score: 82.5 / 100 (large)
    - Model: XGBoost v2.1
    - Top 5 contributing features (bar chart, SHAP values)
      Green bars = positive contribution, Red bars = negative
    - "Explain Score" button (shows detailed SHAP explanation)

  SECTION: Contact Info
    - Email (with copy button + email verification badge)
    - Phone (with copy button)
    - LinkedIn (external link)
    - Title / Seniority level
    - Is Decision Maker: Yes/No badge
    - Tenure: X months in role

  SECTION: Company Info
    - Company name + favicon
    - Website (external link)
    - Industry | Size | Founded Year
    - HQ Location
    - LinkedIn company link
    - Glassdoor Rating (stars)

  SECTION: Funding Info
    - Total Funding: $XX.XM
    - Last Round: Series B | $15M | Jan 2025
    - Investors: [list]

  SECTION: Tech Stack
    - Chips for each detected technology
    - CRM: Salesforce | Marketing: HubSpot | ...

  SECTION: Similar Leads
    - 5 leads with highest similarity score
    - Shown as mini-cards with score + tier
    - "View" link for each

--------------------------------------------------------------------------------
12.5 Page: Analytics / Model Performance (/analytics)
--------------------------------------------------------------------------------

  SECTION: Model Health Overview
    - Model version | Training date | Status badge
    - Key metrics cards: AUC-ROC | Precision@10% | Recall | Brier Score

  SECTION: ROC Curve (Recharts LineChart)
    - True Positive Rate vs False Positive Rate
    - Area under curve annotated on chart

  SECTION: Precision-Recall Curve (Recharts LineChart)
    - Precision vs Recall tradeoff

  SECTION: Score Distribution Over Time
    - Stacked area chart: Hot/Warm/Cold volume per week

  SECTION: Tier Conversion Performance
    - Bar chart: Actual conversion rate by tier
    - Shows: Hot = 23% | Warm = 9% | Cold = 2%
    - Benchmarked against overall average

  SECTION: Feature Importance
    - Horizontal bar chart (top 20 features)
    - Toggle: SHAP importance vs model built-in importance

  SECTION: A/B Test Dashboard (if test active)
    - Model A vs B conversion rates
    - Statistical significance indicator
    - Sample sizes
    - Recommendation: "Not enough data yet — minimum 2 weeks"

  SECTION: Lead Source Quality
    - Table: Source | Leads | Hot % | Conversion Rate | Avg Score
    - Helps identify best-performing acquisition channels

--------------------------------------------------------------------------------
12.6 Page: Settings (/settings)
--------------------------------------------------------------------------------

  TAB: General
    - Workspace name, logo upload, timezone
    - Product description (used for AI email/insight context)
    - Scoring tier thresholds (sliders: Hot >= X, Warm >= Y)
    - Email tone preference

  TAB: Team (/settings/team)
    - User table: Name | Email | Role | Status | Last Login | Actions
    - Invite by email (with role selection)
    - Role change dropdown per user
    - Deactivate toggle per user

  TAB: Integrations (/settings/integrations)
    - API key management section per source:
        Clearbit | Hunter.io | Crunchbase | Apollo | BuiltWith | News API
        Each card: Status badge | Last used | [Update Key] button
    - CRM Webhooks:
        Outbound webhook URL for score change events
        HubSpot OAuth connection
        Salesforce OAuth connection

  TAB: Billing (future)
    - Plan tier display
    - Usage: X of Y leads used this month
    - Upgrade CTA


================================================================================
SECTION 13 — AUTOMATION WORKFLOWS
================================================================================

--------------------------------------------------------------------------------
13.1 End-to-End Lead Pipeline
--------------------------------------------------------------------------------

  TRIGGER: New lead created (via API POST, CSV import, CRM sync, or manual form)

  STEP 1 — VALIDATION
    Handler : LeadValidationTool (synchronous, < 100ms)
    Actions :
      - Validate email format (regex + MX record check)
      - Deduplicate by email within organization
      - Normalize field formats (phone E.164, country ISO)
      - Create lead record in DB with status = 'new'
      - Queue enrichment job
    Output  : lead_id, validation_result (pass/fail/partial)

  STEP 2 — ENRICHMENT (async, background worker)
    Handler : LeadEnrichmentAgent
    Trigger : Enrichment job picked up by worker process
    Actions :
      1. Update lead status = 'enriching'
      2. Extract domain from email or website
      3. Parallel API calls:
           - ClearbitEnrichmentTool (company + person)
           - HunterEmailTool (email verification)
           - CrunchbaseTool (funding data)
      4. If Clearbit fails: fallback to LinkedInScraperTool
      5. Run TechStackDetectorTool (BuiltWith API)
      6. Write enrichment results to lead_enrichment table
      7. Calculate enrichment_completeness_pct
      8. Update lead status = 'enriched' or 'partially_enriched'
      9. Queue signal detection job
    Timeout : 120 seconds max (fail gracefully, proceed with partial data)
    Retry   : 3x with exponential backoff on transient failures

  STEP 3 — SIGNAL DETECTION (async, background worker)
    Handler : SignalDetectionAgent
    Trigger : Enrichment job complete → signal detection job queued
    Actions :
      1. Pull enriched company data from lead_enrichment
      2. Parallel signal checks:
           - Check Crunchbase for recent funding (< 90 days)
           - Check LinkedIn Jobs API for open role count
           - Check NewsAPITool for company news mentions
           - Check TechStackDetectorTool for new tech adoptions
      3. Evaluate each signal type against detection criteria
      4. Create lead_signals records for each detected signal
      5. Compute composite buying_intent_score (weighted sum)
      6. Update leads.buying_intent_score
      7. Queue scoring job
    Timeout : 60 seconds max

  STEP 4 — ML SCORING (async, background worker)
    Handler : ScoringOrchestrationAgent
    Trigger : Signal detection complete → scoring job queued
    Actions :
      1. Run FeatureExtractorTool (assemble feature vector from all data)
      2. Route via ModelABTestRouter (model A or B based on traffic split)
      3. Call MLScoringTool (POST to ML model API endpoint)
      4. Receive score (0–1 probability) + SHAP values
      5. Scale score to 0–100
      6. Classify tier (Hot/Warm/Cold) based on thresholds
      7. Write record to lead_scores table
      8. Update leads.current_score, leads.tier, leads.last_scored_at
      9. Update leads.status = 'scored'
      10. Queue AI insight + email generation job (if score >= 50)
    Timeout : 10 seconds max

  STEP 5 — AI CONTENT GENERATION (async, background worker)
    Handler : LeadResearchAgent + EmailGenerationAgent
    Trigger : Scoring complete for high-score leads (score >= 50)
    Actions :
      1. LeadResearchAgent reads lead_research.md workflow
      2. Constructs research prompt with enrichment + signals + score context
      3. Optionally searches for recent company news
      4. Calls LLM for insight generation
      5. Parses: insight_reason, insight_signal, insight_opener
      6. EmailGenerationAgent reads email_generation.md workflow
      7. Generates subject_a, subject_b, email_body
      8. Writes all content to lead_ai_content table
      9. Triggers real-time notification to frontend (score + insight ready)
    Timeout : 30 seconds max

  STEP 6 — DASHBOARD UPDATE (real-time)
    Handler : Supabase Realtime subscription on leads table
    Trigger : leads.current_score or leads.tier updated
    Actions :
      1. Frontend receives real-time event via WebSocket
      2. React Query cache invalidated for affected lead
      3. Dashboard summary cards re-calculated
      4. Activity feed shows "Score updated" event
      5. Priority list re-sorted with new score

--------------------------------------------------------------------------------
13.2 Daily Re-Scoring Job
--------------------------------------------------------------------------------

  SCHEDULE : Daily at 06:00 UTC
  HANDLER  : Cron job → bulk scoring worker

  Actions:
    1. Query all leads where:
       - last_scored_at < NOW() - INTERVAL '24 hours'
       - lead_status NOT IN ('disqualified', 'converted', 'archived')
    2. Check for new signals since last score:
       - Re-run signal detection for companies with news in last 24h
    3. Batch-score all qualifying leads
    4. Update tier if changed
    5. If tier changed from Warm → Hot: trigger AI content regeneration
    6. Log: X leads re-scored, Y tier upgrades, Z tier downgrades

--------------------------------------------------------------------------------
13.3 CRM Sync Job
--------------------------------------------------------------------------------

  SCHEDULE : Every 60 minutes (configurable)
  HANDLER  : CRM sync worker

  Actions:
    1. Pull new/updated leads from HubSpot / Salesforce since last sync
    2. Ingest via standard lead ingestion pipeline
    3. Push score updates back to CRM (update lead score field)
    4. Log sync summary (created/updated/errors)

--------------------------------------------------------------------------------
13.4 Model Retraining Pipeline (Weekly / On-Demand)
--------------------------------------------------------------------------------

  SCHEDULE : Weekly (Sunday 02:00 UTC) + manual trigger
  HANDLER  : ML retraining job

  Actions:
    1. Extract training dataset:
       - Join leads + lead_enrichment + lead_scores + sales_activity
       - Filter: leads with known outcome (converted/disqualified)
       - Label: converted_90d = 1 if converted, 0 if disqualified
    2. Feature engineering pipeline
    3. Train new XGBoost model with latest data
    4. Evaluate on held-out test set
    5. Compare AUC vs current production model
    6. If new model AUC > current + 0.01: promote to staging
    7. Notify RevOps admin: "New model available — AUC 0.83 vs 0.81"
    8. Admin reviews, approves → deploy to A/B test at 10% traffic


================================================================================
SECTION 14 — DEPLOYMENT ARCHITECTURE
================================================================================

--------------------------------------------------------------------------------
14.1 Infrastructure Overview
--------------------------------------------------------------------------------

  Frontend   → Vercel (Next.js)
  Backend    → Railway.app or Render (FastAPI)
  Database   → Supabase (PostgreSQL + Auth + Realtime + Storage)
  Queue      → Redis (Railway Redis add-on or Upstash)
  ML Model   → Railway (separate FastAPI service)
  Storage    → Supabase Storage (model artifacts, CSV exports)
  CDN        → Vercel Edge Network
  Monitoring → Sentry (errors) + Datadog or Railway metrics

--------------------------------------------------------------------------------
14.2 Service Deployment Details
--------------------------------------------------------------------------------

FRONTEND — Vercel
  - Next.js 14 App Router
  - Environment variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Preview deployments on every PR (auto-generated URL)
  - Production deployment: merge to main → auto deploy
  - Edge Functions for API proxying + auth middleware
  - Build command: next build
  - Root directory: /frontend

BACKEND API — Railway
  - Docker container: python:3.11-slim
  - Dockerfile: COPY requirements.txt → pip install → COPY src → uvicorn
  - Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
  - Environment variables: DATABASE_URL, SUPABASE_SERVICE_KEY, REDIS_URL,
    ML_SERVICE_URL, ANTHROPIC_API_KEY, CLEARBIT_API_KEY, etc.
  - Health check: GET /health (returns 200 + version)
  - Auto-scale: Railway's horizontal scaling (2 instances default)
  - Memory: 1GB per instance

BACKGROUND WORKERS — Railway (separate service)
  - Same Docker image as API
  - Start command: python -m workers.main
  - Worker framework: ARQ (asyncio-based Redis job queue)
  - Worker concurrency: 10 parallel jobs
  - Memory: 2GB (enrichment requires more memory)
  - Separate scaling from API

ML MODEL SERVER — Railway (separate service)
  - Python FastAPI service
  - Loads model artifacts from Supabase Storage on startup
  - Endpoint: POST /predict (accepts feature vector JSON)
  - Memory: 2GB (model artifacts + SHAP explainer in memory)
  - GPU not required (XGBoost CPU inference < 10ms)

DATABASE — Supabase
  - PostgreSQL 15
  - Connection pooling: PgBouncer (Supabase built-in)
  - Row Level Security (RLS) policies for multi-tenancy
  - Supabase Auth (JWT, social login optional)
  - Realtime: enabled on leads table (score/tier changes)
  - Storage: buckets for model artifacts, CSV exports

REDIS — Upstash or Railway Redis
  - Caching: enrichment results (TTL: 7 days)
  - Job queue: ARQ job queue
  - Rate limiting: sliding window counters
  - Session data (short TTL)

--------------------------------------------------------------------------------
14.3 CI/CD Pipeline
--------------------------------------------------------------------------------

Version Control: GitHub
CI/CD: GitHub Actions

  Workflow: .github/workflows/main.yml

  ON PR OPEN:
    - Lint (ruff for Python, eslint for TypeScript)
    - Type check (mypy for Python, tsc for TypeScript)
    - Unit tests (pytest for Python, jest for TypeScript)
    - Integration tests (pytest with test Supabase instance)
    - Security scan (bandit for Python, npm audit)
    - PR comment: test results + coverage %

  ON MERGE TO MAIN:
    - All PR checks re-run
    - Build Docker images (API + Workers + ML)
    - Push to GitHub Container Registry (ghcr.io)
    - Deploy to Railway (via Railway GitHub Actions integration)
    - Deploy frontend to Vercel (automatic on push)
    - Run database migrations (alembic upgrade head)
    - Smoke tests: hit /health, /leads, /analytics endpoints
    - Notify Slack: "Deployed v1.x.x to production"

  DATABASE MIGRATIONS:
    - Alembic for schema migrations
    - All migrations version-controlled in /migrations
    - Zero-downtime migrations (additive only in v1)
    - Rollback: alembic downgrade -1

--------------------------------------------------------------------------------
14.4 Environment Configuration
--------------------------------------------------------------------------------

  Environments: development | staging | production

  .env files (never committed):
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
    SUPABASE_ANON_KEY
    DATABASE_URL
    REDIS_URL
    ML_SERVICE_URL
    ANTHROPIC_API_KEY        (for AI insights + email generation)
    CLEARBIT_API_KEY
    HUNTER_API_KEY
    CRUNCHBASE_API_KEY
    NEWSAPI_KEY
    BUILTWIDTH_API_KEY
    JWT_SECRET
    ENCRYPTION_KEY           (for API key storage)
    SENTRY_DSN
    ENVIRONMENT              (development|staging|production)


================================================================================
SECTION 15 — SUCCESS METRICS
================================================================================

--------------------------------------------------------------------------------
15.1 Product Metrics (North Star)
--------------------------------------------------------------------------------

  PRIMARY KPI: Lead-to-SQL Conversion Rate
    - Baseline (before platform): X%
    - Target (after 90 days): X + 30% relative improvement
    - Measurement: SQL rate for rep using platform vs. control group

  SECONDARY KPIs:
    - Time-to-first-contact: target < 2 hours for Hot leads
    - Hot lead precision: % of Hot-scored leads that convert (target > 25%)
    - Rep NPS: Net Promoter Score from reps using the platform (target > 40)
    - Daily Active Users (DAU) / Monthly Active Users (MAU) ratio

--------------------------------------------------------------------------------
15.2 ML Model Metrics
--------------------------------------------------------------------------------

  AUC-ROC                : Target > 0.75 (acceptable), > 0.80 (excellent)
  Precision at Top 10%   : Target > 50% (selecting top 10% should yield
                           50%+ conversion rate vs. ~10% baseline)
  Recall                 : Target > 60%
  Brier Score            : Target < 0.18 (well-calibrated probabilities)
  Feature drift          : Monitor monthly — alert if feature distribution
                           shifts > 2 standard deviations

--------------------------------------------------------------------------------
15.3 System Performance Metrics
--------------------------------------------------------------------------------

  Enrichment completion rate     : > 85% of leads fully enriched
  Avg enrichment time            : < 90 seconds per lead
  Scoring pipeline success rate  : > 99%
  API p95 latency                : < 300ms
  Dashboard p95 load time        : < 2 seconds
  Worker queue depth             : Alert if > 500 jobs pending > 5 minutes

--------------------------------------------------------------------------------
15.4 Business Metrics
--------------------------------------------------------------------------------

  MRR growth (post-launch)         : Track monthly
  Customer churn rate              : Target < 5% monthly
  Time-to-value for new customers  : Lead scoring working < 24 hours of signup
  Support ticket volume            : < 2 tickets per customer per month


================================================================================
SECTION 16 — FUTURE IMPROVEMENTS
================================================================================

PHASE 2 — 3 to 6 Months Post-Launch

  FI-201 : Chrome Extension
    - Browser extension that shows lead score overlay when rep visits a
      company LinkedIn profile or website
    - Real-time lookup via API

  FI-202 : Native CRM Integration (bidirectional sync)
    - Salesforce managed package
    - HubSpot certified integration
    - Two-way sync: leads in, scores out, activity back in

  FI-203 : Intent Data Integration
    - G2 Buyer Intent API
    - Bombora intent signals
    - 6sense integration
    - These provide anonymous web research signals indicating buying intent

  FI-204 : Sequence / Cadence Builder
    - AI-generated multi-step outreach sequences (not just single email)
    - Step 1: Email → Step 2: LinkedIn → Step 3: Call → Step 4: Email

  FI-205 : Mobile App (iOS / Android)
    - Today's priority list on mobile
    - One-tap call log
    - Push notifications for score upgrades

PHASE 3 — 6 to 12 Months Post-Launch

  FI-301 : Account-Based Intelligence
    - Shift from contact-level to account-level scoring
    - Multiple contacts at same company aggregated into account score
    - Account engagement map (multi-threaded selling)

  FI-302 : Predictive Pipeline Forecasting
    - Use lead score distribution + historical conversion to forecast
      pipeline value with confidence intervals
    - Board-ready pipeline charts

  FI-303 : Custom ML Models Per Customer
    - Each enterprise customer gets a model trained on their own historical data
    - Model trained using their CRM outcomes + their enrichment data
    - Requires minimum 2,000 labeled leads per customer

  FI-304 : Real-Time Scoring API
    - Sub-100ms lead scoring for high-volume use cases
    - Batch scoring API for 10K+ leads per request

  FI-305 : Competitive Intelligence Layer
    - Detect when a lead company is actively evaluating competitors
    - Track competitor job posts, press releases, G2 reviews

  FI-306 : AI Coach for Reps
    - After a call logged as "disqualified", AI suggests why and what to
      try differently next time
    - Based on pattern recognition across similar leads


================================================================================
SECTION 17 — HACKATHON WINNING STRATEGY & MONETIZATION
================================================================================

--------------------------------------------------------------------------------
17.1 Why Judges Will Be Impressed
--------------------------------------------------------------------------------

  TECHNICAL SOPHISTICATION
    The WAT Framework (Workflows / Agents / Tools) architecture demonstrates
    a mature, production-grade approach to AI system design. It's not a
    single-prompt "chatbot" — it's a multi-agent orchestration system with
    clear separation of concerns. Judges with engineering backgrounds will
    recognize this as a real architecture pattern used at scale.

  REAL-WORLD COMPLETENESS
    The project addresses a problem that every B2B company faces. The system
    has a complete data pipeline: ingestion → enrichment → signals → ML → AI →
    dashboard. Most hackathon projects solve one piece; this solves all of them.

  ML + LLM COMBINATION
    Combining classical ML (XGBoost with SHAP explainability) with modern LLM
    usage (insight generation, email drafting) shows sophisticated judgment.
    The ML model is not just a prompt — it's a proper trained classifier.
    This hybrid approach is exactly what production AI systems look like.

  EXPLAINABILITY
    Using SHAP values to explain ML predictions, then translating them to
    natural language via LLM, solves one of the most common enterprise objections
    to AI: "I don't trust a black box." This is a differentiating feature.

  DEMO-READY DESIGN
    The Shadcn UI dashboard with real-time score updates, AI insight cards,
    and model performance charts makes for an impressive live demo. Visual
    impact matters in hackathon judging.

--------------------------------------------------------------------------------
17.2 Real Industry Use Cases
--------------------------------------------------------------------------------

  USE CASE 1 — Series A SaaS Company
    A 15-person sales team receives 400 leads/month from marketing. They have
    no scoring system. Reps call leads in the order they were added to HubSpot.
    Implementation: Connect HubSpot → 400 leads scored in 2 hours → reps
    immediately see top 40 Hot leads → conversion rate improves measurably
    in first week.

  USE CASE 2 — Enterprise Software SDR Team
    An enterprise SaaS company has 50 SDRs working an outbound list of 20,000
    contacts. Team needs to know which companies are currently "in market."
    Implementation: Signal detection surfaces 200 companies that raised
    funding or are actively hiring in last 30 days → SDRs prioritize these
    accounts → pipeline generated per hour of selling time improves.

  USE CASE 3 — Revenue Operations Analyst
    A RevOps analyst at a Series C company needs to justify the lead scoring
    investment to the CRO. Implementation: Model performance dashboard shows
    Hot-tier leads converting at 23% vs. 4% for Cold → ROI of scoring
    demonstrated in one dashboard view → budget approved.

--------------------------------------------------------------------------------
17.3 Path to Startup
--------------------------------------------------------------------------------

  PROBLEM-MARKET FIT
    Hundreds of companies sell "lead enrichment" (Clearbit, Apollo, ZoomInfo)
    and some sell "lead scoring" (MadKudu, Breadcrumbs). But none combine
    enrichment + signal detection + ML scoring + AI explanation + email
    generation in a single, affordable, easy-to-deploy product aimed at
    SMB / mid-market.

  UNFAIR ADVANTAGES
    - WAT Framework makes the system uniquely extensible (add new agents
      without touching scoring logic)
    - SHAP-powered explanations build rep trust (higher adoption)
    - AI email generation drives daily active usage (reps return for emails)
    - Outcome feedback loop improves model over time (data moat)

  GO-TO-MARKET STRATEGY
    - PLG (Product-Led Growth): free tier with 100 leads/month
    - Target: SDR managers at Series A–C SaaS companies
    - Channel: LinkedIn ads targeting "Revenue Operations" + "Sales Enablement"
    - Integration partnerships: HubSpot App Marketplace, Salesforce AppExchange

--------------------------------------------------------------------------------
17.4 Monetization Model
--------------------------------------------------------------------------------

  TIER 1 — FREE
    100 leads/month enriched + scored
    Basic dashboard
    CSV import only
    No AI insights or email generation
    Watermark on exports

  TIER 2 — PRO ($99/month per workspace)
    5,000 leads/month
    Full enrichment (all sources)
    AI insights + email generation
    CRM integrations (HubSpot, Salesforce)
    Model performance dashboard
    Up to 10 team members
    Email support

  TIER 3 — GROWTH ($299/month per workspace)
    25,000 leads/month
    Custom scoring thresholds
    A/B model testing
    API access
    Webhook integrations
    Up to 50 team members
    Priority support + onboarding call

  TIER 4 — ENTERPRISE (custom pricing, starting $2,000/month)
    Unlimited leads
    Custom ML model training on customer's historical data
    Dedicated model training pipeline
    SSO (SAML)
    Custom data retention policies
    GDPR DPA
    Dedicated CSM
    SLA: 99.9% uptime guarantee

  UNIT ECONOMICS (PRO TIER EXAMPLE):
    CAC: ~$200 (PLG + outbound)
    MRR per customer: $99
    Gross margin: ~80% (API costs ~ $20/customer/month)
    Payback period: ~2 months
    LTV (24-month average): ~$2,376
    LTV/CAC ratio: ~11.9x


================================================================================
DOCUMENT CONTROL
================================================================================

  Version    : 1.0
  Status     : Draft — Ready for Engineering Review
  Owner      : Product Management
  Reviewers  : Engineering Lead, ML Lead, Design Lead, Revenue Operations
  Next Review: Two weeks after distribution

  Change Log:
    v1.0 — Initial draft, complete PRD for hackathon submission

  Approval Required From:
    [ ] Engineering Lead
    [ ] ML Lead
    [ ] Design Lead (UI/UX sections)
    [ ] Legal (GDPR/CCPA section review)

================================================================================
END OF DOCUMENT — AI LEAD INTELLIGENCE PLATFORM PRD v1.0
================================================================================