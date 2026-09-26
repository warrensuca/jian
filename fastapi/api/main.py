from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .routers import (
    auth,
    favorited_recipes,
    recipe_interactions,
    recipe_ratings,
)

from .database import Base, engine

app = FastAPI(title="Jian Backend API")

Base.metadata.create_all(bind=engine)

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://warrensu-jian.vercel.app",
]

frontend_env = os.getenv("FRONTEND_URL")
if frontend_env:
    for url in frontend_env.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"message": "Jian Backend API is running"}

app.include_router(auth.router)
app.include_router(favorited_recipes.router)
app.include_router(recipe_ratings.router)
app.include_router(recipe_interactions.router)
