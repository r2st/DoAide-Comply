from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://comply:comply@localhost:5432/comply"
    jwt_secret: str = "change-me-in-production-use-32+-chars"
    jwt_expire_minutes: int = 60 * 24 * 7
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-4-maverick:free"
    openrouter_url: str = "https://openrouter.ai/api/v1/chat/completions"
    cors_origins: str = "*"
    site_url: str = "https://comply.doaide.com"


settings = Settings()
