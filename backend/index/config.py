from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Index project:
    BACKEND_PORT: int = 8000
    BACKEND_URL: str = "http://localhost:8000"

    # API settings:
    API_SERVER: str = "https://platform.cosmos-suite.ai"
    COSMOS_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
