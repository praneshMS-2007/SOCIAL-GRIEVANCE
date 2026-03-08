import os
from dotenv import load_dotenv
load_dotenv()

from google import genai

key = os.getenv("GOOGLE_API_KEY")
print(f"Using key: {key[:12]}...{key[-4:]}")

client = genai.Client(api_key=key)

# Try models
for model_name in ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"]:
    print(f"\nTrying {model_name}:")
    try:
        r = client.models.generate_content(
            model=model_name,
            contents="Say hello in 3 words"
        )
        print(f"  SUCCESS: {r.text.strip()}")
        break
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {str(e)[:300]}")
