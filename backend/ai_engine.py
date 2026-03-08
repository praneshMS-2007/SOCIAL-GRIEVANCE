import os
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# Thread pool for running sync Gemini calls without blocking the event loop
_executor = ThreadPoolExecutor(max_workers=4)

# Timeout for Gemini API calls (seconds)
AI_TIMEOUT = 10

# Track whether Gemini is available
# Defaults to False since free tier quota may be exceeded
# Set GEMINI_ENABLED=true in .env when quota resets to use AI classification
_gemini_available = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
if _gemini_available:
    print("🤖 Gemini AI enabled — will attempt API calls")
else:
    print("⚡ Using keyword-based classifier (set GEMINI_ENABLED=true in .env to use Gemini AI)")

DEPARTMENTS = [
    "Water Supply & Sanitation",
    "Roads & Transport",
    "Electricity & Power",
    "Healthcare & Hospitals",
    "Education",
    "Revenue & Land",
    "Law & Order",
    "Municipal Administration"
]

URGENCY_LEVELS = ["low", "medium", "high", "critical"]


def _call_gemini_sync(prompt: str) -> str:
    """Synchronous Gemini call — run in thread pool."""
    response = model.generate_content(
        prompt,
        request_options={"timeout": AI_TIMEOUT}
    )
    if not response or not response.text:
        raise RuntimeError("Empty response from Gemini")
    return response.text.strip()


async def _call_gemini_async(prompt: str) -> str:
    """Async wrapper for Gemini with timeout."""
    global _gemini_available
    if not _gemini_available:
        raise RuntimeError("Gemini API temporarily disabled due to quota/errors")

    loop = asyncio.get_event_loop()
    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(_executor, _call_gemini_sync, prompt),
            timeout=AI_TIMEOUT + 2
        )
        return result
    except (asyncio.TimeoutError, TimeoutError):
        print(f"⏰ Gemini API timed out — disabling for this session")
        _gemini_available = False
        raise
    except Exception as e:
        error_str = str(e).lower()
        if "quota" in error_str or "429" in error_str or "resource" in error_str:
            print(f"⚠️ Gemini quota exceeded — disabling for this session")
            _gemini_available = False
        raise


def _clean_json_response(text: str) -> str:
    """Remove markdown fences from JSON response."""
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()


def _keyword_classify(title: str, description: str) -> dict:
    """Keyword-based fallback when Gemini API is unavailable."""
    text = f"{title} {description}".lower()

    keyword_map = {
        "Water Supply & Sanitation": ["water", "drainage", "sewage", "pipe", "toilet", "sanitation", "bore", "tank", "supply", "disposal", "well", "tap"],
        "Roads & Transport": ["road", "pothole", "bus", "traffic", "bridge", "footpath", "highway", "transport", "signal", "parking", "street"],
        "Electricity & Power": ["electric", "power", "light", "transformer", "voltage", "meter", "billing", "outage", "current", "wire", "eb"],
        "Healthcare & Hospitals": ["hospital", "doctor", "medicine", "health", "clinic", "ambulance", "treatment", "medical", "disease", "patient"],
        "Education": ["school", "teacher", "education", "college", "student", "exam", "scholarship", "classroom", "mid-day", "syllabus"],
        "Revenue & Land": ["land", "property", "tax", "patta", "survey", "encroachment", "revenue", "deed", "registration", "chitta"],
        "Law & Order": ["police", "crime", "theft", "safety", "murder", "harassment", "complaint", "station", "security", "violence"],
        "Municipal Administration": ["garbage", "waste", "park", "building", "permit", "license", "municipal", "corporation", "cleaning"],
    }

    best_category = "Municipal Administration"
    best_score = 0
    for category, keywords in keyword_map.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            best_category = category

    # Simple urgency from keywords
    urgency = "medium"
    critical_words = ["death", "life", "emergency", "danger", "collapse", "flood", "fire", "critical", "dying"]
    high_words = ["urgent", "serious", "immediate", "broken", "leaking", "accident", "no supply", "damaged"]
    if any(w in text for w in critical_words):
        urgency = "critical"
    elif any(w in text for w in high_words):
        urgency = "high"

    return {
        "category": best_category,
        "urgency": urgency,
        "sentiment_score": 0.5,
        "summary_en": title
    }


async def classify_grievance(title: str, description: str, language: str = "en") -> dict:
    """Classify a grievance. Tries Gemini first, falls back to keyword matching."""
    global _gemini_available

    # If Gemini is known to be down, skip immediately
    if not _gemini_available:
        print("ℹ️ Using keyword classifier (Gemini unavailable)")
        return _keyword_classify(title, description)

    prompt = f"""You are an AI grievance classification engine for Indian public services.
Analyze the following citizen complaint and return a JSON object with exactly these fields:
- "category": one of {json.dumps(DEPARTMENTS)}
- "urgency": one of {json.dumps(URGENCY_LEVELS)}
- "sentiment_score": a float from 0.0 (calm) to 1.0 (extreme distress)
- "summary_en": a one-line English summary of the complaint

The complaint may be in English, Hindi, or Tamil. Understand it regardless of language.

Title: {title}
Description: {description}
Language: {language}

IMPORTANT: Return ONLY valid JSON. No extra text, no markdown fences."""

    try:
        text = await _call_gemini_async(prompt)
        text = _clean_json_response(text)
        result = json.loads(text)

        # Validate and sanitize
        if result.get("category") not in DEPARTMENTS:
            result["category"] = "Municipal Administration"
        if result.get("urgency") not in URGENCY_LEVELS:
            result["urgency"] = "medium"
        sentiment = float(result.get("sentiment_score", 0.5))
        result["sentiment_score"] = max(0.0, min(1.0, sentiment))

        # Sentiment-aware urgency boost
        if result["sentiment_score"] >= 0.8 and result["urgency"] in ["low", "medium"]:
            result["urgency"] = "high"
        elif result["sentiment_score"] >= 0.9 and result["urgency"] == "high":
            result["urgency"] = "critical"

        return result
    except Exception as e:
        print(f"AI classification error: {e} — using keyword fallback")
        return _keyword_classify(title, description)


async def lawyer_bot_response(grievance_text: str, category: str) -> str:
    """Provide legal entitlement guidance for a grievance."""
    prompt = f"""You are a Citizen Lawyer Bot for Indian public services. A citizen has filed a grievance 
in the category: "{category}".

Their complaint: "{grievance_text}"

Provide helpful legal guidance in a friendly, accessible tone:
1. Which specific Indian law, act, or government scheme is relevant to their complaint
2. What their legal entitlements are under that law
3. Which authority they can escalate to if unresolved (specific designation/office)
4. Suggested next steps they can take

Keep the response concise (under 300 words), practical, and in simple language.
If the complaint is in Hindi or Tamil, respond in the same language."""

    try:
        return await _call_gemini_async(prompt)
    except Exception as e:
        print(f"Lawyer bot error: {e}")
        return f"""I'm currently unable to connect to the AI service due to API quota limits.

Here's general guidance for your {category} grievance:

1. **File a formal complaint** with the relevant department
2. **Use RTI Act 2005** to request information about your case status
3. **Escalate** to the District Collector's office if no response within 30 days
4. **Contact the Ombudsman** for your state for unresolved grievances

The AI legal guidance will be available once the API quota resets."""


async def translate_text(text: str, target_lang: str) -> str:
    """Translate text to target language."""
    lang_map = {"en": "English", "hi": "Hindi", "ta": "Tamil"}
    target = lang_map.get(target_lang, "English")

    prompt = f"""Translate the following text to {target}. 
Return ONLY the translated text, nothing else.

Text: {text}"""

    try:
        return await _call_gemini_async(prompt)
    except Exception as e:
        print(f"Translation error: {e}")
        return text


async def check_similarity(new_description: str, existing_descriptions: list[str]) -> float:
    """Check how similar a new grievance is to existing ones. Returns similarity score 0-1."""
    if not existing_descriptions:
        return 0.0

    sample = existing_descriptions[:5]
    prompt = f"""Compare this new complaint with existing ones and return a similarity score.

New complaint: "{new_description}"

Existing complaints:
{json.dumps(sample)}

Return ONLY a JSON object: {{"similarity_score": <float 0.0 to 1.0>}}
0.0 = completely different topics, 1.0 = nearly identical issue."""

    try:
        text = await _call_gemini_async(prompt)
        text = _clean_json_response(text)
        result = json.loads(text)
        return float(result.get("similarity_score", 0.0))
    except Exception:
        return 0.0
