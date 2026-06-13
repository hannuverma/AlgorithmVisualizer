from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import Union

class Settings(BaseSettings):
    PROJECT_NAME: str = " Algorithm Visualizer"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    ALLOWED_ORIGINS: Union[list[str], str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173", "https://algorithm-visualizer-theta-steel.vercel.app", "https://algorithmvisualizer-zxqj.onrender.com"],  
        description="List of origins allowed to cross-site HTTP requests"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

settings = Settings()