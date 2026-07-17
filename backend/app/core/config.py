
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://hcp_user:hcp_pass@localhost:5432/hcp_crm"

    # JWT
    JWT_SECRET_KEY: str = "change-this-to-a-secure-random-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Groq
    GROQ_API_KEY: str = ""
    GROQ_EXTRACT_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FOLLOWUP_MODEL: str = "llama-3.3-70b-versatile"

    # App
    APP_NAME: str = "PharmaConnect CRM"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://pharmacyconnect-ailog-1.onrender.com",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


settings = Settings()