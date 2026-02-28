"""
Configuration — app/config.py
───────────────────────────────
pydantic-settings reads variables from environment / .env file automatically.
Each class field maps 1-to-1 to an env variable (case-insensitive).

The DATABASE_URL is assembled from parts so that DB_HOST can differ
between Docker ('db') and local dev ('localhost') without re-writing the URL.
"""

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────────
    APP_NAME:    str  = "FastAPI Books API"
    APP_VERSION: str  = "1.0.0"
    DEBUG:       bool = False

    # ── Database parts ───────────────────────────────────────────
    # Kept separate so DB_HOST can differ between Docker and local
    DB_USER:     str
    DB_PASSWORD: str
    DB_HOST:     str = "db"      # 'db' = Docker service name; 'localhost' = local
    DB_PORT:     int = 5432
    DB_NAME:     str

    # ── Computed: assemble the full async URL ────────────────────
    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        # asyncpg is the async PostgreSQL driver used by SQLAlchemy
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # Tell pydantic-settings to load from a .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Module-level singleton — import this everywhere you need config
settings = Settings()
