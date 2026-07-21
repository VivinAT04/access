from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Aksess API"
    app_env: str = "development"
    debug: bool = True

    database_url: str = "sqlite:///./aksess.db"

    secret_key: str = "change-this-secret"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    web_app_url: str = "http://localhost:3000"
    mobile_app_url: str = "http://localhost:8081"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
