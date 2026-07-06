from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pathlib

from backend.database import engine
from backend import models
from backend.routers import auth, users, games, messages


# ─── Lifespan: create tables on startup ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables (safe no-op if they already exist)
    models.Base.metadata.create_all(bind=engine)
    print("Database tables created / verified.")
    yield                      # app runs here
    # (add shutdown cleanup here if needed)


# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Gamer Chat API",
    description=(
        "One-to-one messaging + game sharing platform.\n\n"
        "Authenticate via `/auth/login`, copy the token, and click "
        "**Authorize** (🔒) at the top of this page to unlock protected routes."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS (allow the frontend dev server / same-origin) ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(games.router)
app.include_router(messages.router)

# ─── Health-check (must be before the static mount) ─────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ─── Serve frontend static files (must be LAST – greedy catch-all) ───────────
frontend_dir = pathlib.Path(__file__).parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
