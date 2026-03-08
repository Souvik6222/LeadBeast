"""
AI Insight & Email Generation Tool — Groq (Llama 3.3 70B)
WAT Layer 3: AI Tool
Production-grade: structured output, retry logic, quality prompts
"""
import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# Model preference: Llama 3.3 70B for quality, fallback to smaller models
GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]


def _groq_chat(messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> str:
    """Call Groq API with model fallback. Returns raw text response."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    last_error = None
    for model in GROQ_MODELS:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"},
            }
            with httpx.Client(timeout=60) as client:
                resp = client.post(GROQ_API_URL, json=payload, headers=headers)

            if resp.status_code == 429:
                print(f"[GROQ] Rate limited on {model}, trying next...")
                last_error = Exception(f"Rate limited on {model}")
                continue

            if resp.status_code != 200:
                error_data = resp.json()
                msg = error_data.get("error", {}).get("message", resp.text)
                print(f"[GROQ] Error on {model}: {msg}")
                last_error = Exception(msg)
                continue

            data = resp.json()
            text = data["choices"][0]["message"]["content"].strip()
            print(f"[GROQ] Success with {model}")
            return text

        except httpx.TimeoutException:
            print(f"[GROQ] Timeout on {model}, trying next...")
            last_error = Exception(f"Timeout on {model}")
            continue
        except Exception as e:
            last_error = e
            if "429" in str(e) or "rate" in str(e).lower():
                continue
            raise

    raise last_error or Exception("All Groq models failed")


def _parse_json(text: str) -> dict:
    """Parse JSON from LLM response, handling markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    return json.loads(text)


async def generate_lead_insight(lead_data: dict, signals: list) -> dict:
    """Generate AI insight for a lead using Groq Llama 3.3."""
    if not GROQ_API_KEY:
        return _fallback_insight(lead_data, signals)

    try:
        signals_text = "\n".join([
            f"- {s.get('signal_type', 'Unknown')}: {s.get('signal_description', 'N/A')} (strength: {s.get('signal_strength', 0)}/10)"
            for s in signals
        ]) if signals else "No buying signals detected yet."

        messages = [
            {
                "role": "system",
                "content": "You are an elite B2B sales intelligence analyst at a Fortune 500 company. "
                           "You provide data-driven, actionable sales insights that help reps close deals. "
                           "Always respond in valid JSON format."
            },
            {
                "role": "user",
                "content": f"""Analyze this lead and generate a sales intelligence briefing.

Lead Profile:
- Name: {lead_data.get('first_name', '')} {lead_data.get('last_name', '')}
- Company: {lead_data.get('company', '')}
- Title: {lead_data.get('title', 'Unknown')}
- Industry: {lead_data.get('industry', 'Unknown')}
- Seniority: {lead_data.get('seniority_level', 'Unknown')}
- Score: {lead_data.get('current_score', 'Not scored')}/100
- Tier: {lead_data.get('tier', 'Not classified')}

Buying Signals:
{signals_text}

Generate a JSON response with these exact fields:
{{
  "reason": "One compelling sentence explaining why this lead should be prioritized NOW — be specific, reference data points",
  "signal": "The single most compelling buying signal with specific context and urgency",
  "opener": "A specific, personalized conversation opener the sales rep should use — NOT generic, reference the lead's company/role/signal"
}}"""
            }
        ]

        text = _groq_chat(messages, temperature=0.6)
        result = _parse_json(text)

        return {
            "insight_reason": result.get("reason", ""),
            "insight_signal": result.get("signal", ""),
            "insight_opener": result.get("opener", ""),
            "insight_text": f"{result.get('reason', '')} {result.get('signal', '')}",
            "llm_model_used": "groq-llama-3.3-70b",
        }

    except Exception as e:
        print(f"[AI_GENERATOR] Insight generation error: {e}")
        return _fallback_insight(lead_data, signals)


async def generate_email_draft(lead_data: dict, signals: list, tone: str = "Professional") -> dict:
    """Generate personalized email draft using Groq Llama 3.3."""
    if not GROQ_API_KEY:
        return _fallback_email(lead_data)

    try:
        signals_text = "\n".join([
            f"- {s.get('signal_description', 'N/A')}"
            for s in signals[:3]
        ]) if signals else "No specific signals."

        messages = [
            {
                "role": "system",
                "content": "You are a world-class B2B sales copywriter who writes emails that get 40%+ open rates. "
                           "Your emails are specific, data-driven, concise, and always include a clear call-to-action. "
                           "Never use generic phrases. Always respond in valid JSON format."
            },
            {
                "role": "user",
                "content": f"""Write a personalized cold outreach email for this prospect.

Tone: {tone}
Prospect: {lead_data.get('first_name', '')} {lead_data.get('last_name', '')}
Title: {lead_data.get('title', '')}
Company: {lead_data.get('company', '')}
Industry: {lead_data.get('industry', '')}
Location: {lead_data.get('location', '')}

Recent company signals/intelligence:
{signals_text}

Requirements:
- Max 120 words for the body — every word must earn its place
- Lead with value, NOT with a pitch
- Reference at least one specific company data point or signal
- End with a single clear, low-friction call-to-action
- Generate 2 subject line variants (A/B testable, under 50 chars)
- NO "I hope this finds you well", NO "I wanted to reach out"
- Write like a trusted advisor, not a salesperson

JSON format:
{{
  "subject_a": "...",
  "subject_b": "...",
  "body": "..."
}}"""
            }
        ]

        text = _groq_chat(messages, temperature=0.7)
        result = _parse_json(text)

        return {
            "email_subject_a": result.get("subject_a", ""),
            "email_subject_b": result.get("subject_b", ""),
            "email_body": result.get("body", ""),
            "email_tone": tone,
            "llm_model_used": "groq-llama-3.3-70b",
        }

    except Exception as e:
        print(f"[AI_GENERATOR] Email generation error: {e}")
        return _fallback_email(lead_data)


def _fallback_insight(lead_data: dict, signals: list) -> dict:
    """Generate a basic insight without LLM."""
    company = lead_data.get("company", "this company")
    tier = lead_data.get("tier", "Unknown")
    score = lead_data.get("current_score", 0)

    signal_text = ""
    if signals:
        top_signal = signals[0]
        signal_text = top_signal.get("signal_description", "buying activity detected")
    else:
        signal_text = "matches your ideal customer profile"

    return {
        "insight_reason": f"This lead at {company} is classified as {tier} with a score of {score}.",
        "insight_signal": signal_text,
        "insight_opener": f"Ask about their recent {signal_text.split()[0].lower() if signal_text else 'growth'} plans.",
        "insight_text": f"This lead at {company} is classified as {tier}. {signal_text}.",
        "llm_model_used": "fallback",
    }


def _fallback_email(lead_data: dict) -> dict:
    """Generate a basic email without LLM."""
    first_name = lead_data.get("first_name", "there")
    company = lead_data.get("company", "your company")

    return {
        "email_subject_a": f"Quick question about {company}'s growth plans",
        "email_subject_b": f"{first_name}, noticed something about {company}",
        "email_body": f"Hi {first_name},\n\nI've been following {company}'s recent growth and wanted to reach out. We help companies like yours streamline their sales process and close deals faster.\n\nWould you be open to a 15-minute chat this week?\n\nBest,\n[Your Name]",
        "email_tone": "Professional",
        "llm_model_used": "fallback",
    }
