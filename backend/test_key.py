import os
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai

key = os.getenv("GOOGLE_API_KEY")
print(f"Using key: {key[:12]}...{key[-4:]}")

genai.configure(api_key=key)

# List available models
print("\nAvailable generative models:")
for m in genai.list_models():
    if hasattr(m, 'supported_generation_methods') and "generateContent" in m.supported_generation_methods:
        print(f"  {m.name}")

# Try models
for model_name in ["gemini-2.5-flash", "gemini-pro", "gemini-1.5-flash"]:
    print(f"\nTrying {model_name}:")
    try:
        model = genai.GenerativeModel(model_name)
        r = model.generate_content("Say hello in 3 words", request_options={"timeout": 15})
        print(f"  SUCCESS: {r.text.strip()}")
        break
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {str(e)[:300]}")
