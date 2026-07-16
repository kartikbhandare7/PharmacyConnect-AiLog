from app.core.config import settings

print("GROQ_API_KEY:", repr(settings.GROQ_API_KEY))
print("Length:", len(settings.GROQ_API_KEY))