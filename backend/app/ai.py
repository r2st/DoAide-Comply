import httpx

from .config import settings

SYSTEM = (
    "You are DoAide Comply, an assistant for Indian business compliance (GST, TDS, ROC, PF/ESI, "
    "income tax, professional tax). Be concise (under 120 words), practical, and mention that "
    "dates should be verified against current government notifications. Do not give legal advice."
)


def explain(question: str, context: str = "") -> str:
    """Ask OpenRouter; falls back to a static message when no key is configured or the call fails."""
    if not settings.openrouter_api_key:
        return "AI explanations are not configured on this server. Please check the penalty details shown with each filing."
    try:
        r = httpx.post(
            settings.openrouter_url,
            headers={"Authorization": f"Bearer {settings.openrouter_api_key}", "HTTP-Referer": settings.site_url,
                     "X-Title": "DoAide Comply"},
            json={
                "model": settings.openrouter_model,
                "max_tokens": 400,
                "messages": [
                    {"role": "system", "content": SYSTEM},
                    {"role": "user", "content": f"{context}\n\nQuestion: {question}".strip()},
                ],
            },
            timeout=30,
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        return "The AI assistant is temporarily unavailable. Please try again shortly."
