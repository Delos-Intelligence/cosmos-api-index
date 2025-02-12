import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Cosmos Index",
        version="0.1.0",
    )
    app.include_router(router)

    # CORS settings
    origins = [
        "http://localhost",
        "http://0.0.0.0",
        "http://localhost:3000",
        "http://localhost:3001",
        f"http://localhost:{settings.BACKEND_PORT}",
        f"{settings.API_SERVER}",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
    return app


app = create_app()


def start() -> None:
    """Start the server."""
    uvicorn.run(
        "index.server:app",
        host="0.0.0.0",
        port=settings.BACKEND_PORT,
        reload=True,
    )
