import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

# Load .env from the backend directory automatically
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)


ANALYSIS_PROMPT = """Analyze the emotional tone of this journal entry.
Return ONLY valid JSON with the following fields:
- emotion (string): the primary emotion detected
- keywords (array of strings): 3-5 key words or themes
- summary (string): a one-sentence summary of the user's mental state

Text:
{journal_text}

Respond with ONLY the JSON object, no extra explanation."""


def analyze_journal_entry(text: str) -> dict:
    """
    Send journal text to Groq LLaMA-3 model and return structured emotion analysis.
    """
    prompt = ANALYSIS_PROMPT.format(journal_text=text)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert psychologist and emotion analyst. "
                    "You analyze journal entries and return structured JSON insights. "
                    "Always respond with valid JSON only."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.1-8b-instant",
        temperature=0.3,
        max_tokens=512,
    )

    raw_response = chat_completion.choices[0].message.content.strip()

    # Extract JSON from response (handle markdown code blocks if present)
    json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
    if json_match:
        raw_response = json_match.group(0)

    result = json.loads(raw_response)

    # Normalise: keywords must be a list
    if isinstance(result.get("keywords"), str):
        result["keywords"] = [k.strip() for k in result["keywords"].split(",")]

    return result
