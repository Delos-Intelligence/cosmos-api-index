from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    BACKEND_PORT: int = 8000
    COSMOS_APIKEY: str = ""

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
