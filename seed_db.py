"""
seed_db.py  –  Create the database, tables, and seed the games library.
Run once after setting your .env credentials:
    python seed_db.py
"""
import sys
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = os.getenv("DB_PORT", "3306")
DB_USER     = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME     = os.getenv("DB_NAME", "gamer_chat")

import pymysql
from sqlalchemy import create_engine

# ── Step 1: create the database if it doesn't exist ──────────────────────────
try:
    conn = pymysql.connect(
        host=DB_HOST,
        port=int(DB_PORT),
        user=DB_USER,
        password=DB_PASSWORD,
    )
    with conn.cursor() as cur:
        cur.execute(
            f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        )
    conn.close()
    print(f"Database '{DB_NAME}' ready.")
except Exception as exc:
    print(f"Failed to create database: {exc}")
    sys.exit(1)

# ── Step 2: create tables via SQLAlchemy ─────────────────────────────────────
from backend.database import SessionLocal, engine
from backend import models

try:
    models.Base.metadata.create_all(bind=engine)
    print("Tables created / verified.")
except Exception as exc:
    print(f"Failed to create tables: {exc}")
    sys.exit(1)

# ── Step 3: seed games ────────────────────────────────────────────────────────
db = SessionLocal()
try:
    default_games = [
        models.Game(game_id="tictactoe", game_name="Tic-Tac-Toe"),
        models.Game(game_id="rps",       game_name="Rock Paper Scissors"),
        models.Game(game_id="memory",    game_name="Memory Match"),
    ]
    for game in default_games:
        if not db.query(models.Game).filter(models.Game.game_id == game.game_id).first():
            db.add(game)
    db.commit()
    print("Games seeded successfully.")
except Exception as exc:
    db.rollback()
    print(f"Seed failed: {exc}")
    sys.exit(1)
finally:
    db.close()

print("\nAll done! Run: uvicorn backend.main:app --reload")
