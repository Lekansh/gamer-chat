"""
seed_db.py  –  Create the database, tables, and seed users, games and messages.
Run once to initialize the database:
    python seed_db.py
"""
import sys
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, DATABASE_URL
from backend import models

print(f"Connecting to database using: {DATABASE_URL}")

# Create tables
try:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    )
    Base.metadata.create_all(bind=engine)
    print("Tables created / verified.")
except Exception as exc:
    print(f"Failed to create tables: {exc}")
    sys.exit(1)

# Seed Data
Session = sessionmaker(bind=engine)
db = Session()

try:
    # 1. Seed Games
    default_games = [
        models.Game(game_id="tictactoe", game_name="Tic-Tac-Toe"),
        models.Game(game_id="rps",       game_name="Rock Paper Scissors"),
        models.Game(game_id="memory",    game_name="Memory Match"),
    ]
    for game in default_games:
        if not db.query(models.Game).filter(models.Game.game_id == game.game_id).first():
            db.add(game)
    print("Games library checked.")

    # 2. Seed Users
    # Using bcrypt hashed password for testpassword: $2b$12$Y1p.6GomY3YF8.yK1z7nZOW6LgN39B9uQ6fG/79tG2zH5qjLz.eK6
    # For lekansh: $2b$12$RjN0Q90f5jA1W2Z3V4U5T6S7R8Q9P0O1N2M3L4K5J6I7H8G9F0E1D2
    hashed_pwd = "$2b$12$RjN0Q90f5jA1W2Z3V4U5T6S7R8Q9P0O1N2M3L4K5J6I7H8G9F0E1D2" # default hashed pw
    
    default_users = [
        {"id": 21, "name": "Test User", "username": "testuser", "gamer_id": "testuser#5306"},
        {"id": 22, "name": "alpha", "username": "alphaaa", "gamer_id": "alphaaa#5940"},
        {"id": 23, "name": "beta", "username": "betaaa", "gamer_id": "betaaa#1024"},
        {"id": 24, "name": "gama", "username": "gamaaa", "gamer_id": "gamaaa#7285"},
        {"id": 25, "name": "delta", "username": "deltaaa", "gamer_id": "deltaaa#2455"},
        {"id": 26, "name": "omega", "username": "omegaaa", "gamer_id": "omegaaa#5851"},
        {"id": 27, "name": "bravo", "username": "bravooo", "gamer_id": "bravooo#2711"},
        {"id": 28, "name": "charlie", "username": "charlieee", "gamer_id": "charlieee#1351"},
        {"id": 29, "name": "BLANKLMT", "username": "LMT", "gamer_id": "LMT#6254"},
        {"id": 30, "name": "pras", "username": "nougat", "gamer_id": "nougat#9779"},
    ]
    
    for u in default_users:
        if not db.query(models.User).filter(models.User.id == u["id"]).first():
            user = models.User(
                id=u["id"],
                name=u["name"],
                username=u["username"],
                gamer_id=u["gamer_id"],
                hashed_password=hashed_pwd
            )
            db.add(user)
    print("Users seeded successfully.")

    # 3. Seed messages
    default_messages = [
        {"id": 1, "sender_id": 28, "receiver_id": 29, "message": "lets play", "timestamp": "2026-07-06 07:37:00"},
        {"id": 2, "sender_id": 27, "receiver_id": 29, "message": "lets play", "timestamp": "2026-07-06 07:37:10"},
        {"id": 3, "sender_id": 26, "receiver_id": 29, "message": "lets play", "timestamp": "2026-07-06 07:37:20"},
        {"id": 4, "sender_id": 24, "receiver_id": 29, "message": "how are u", "timestamp": "2026-07-06 07:37:30"},
        {"id": 5, "sender_id": 29, "receiver_id": 28, "message": "hello", "timestamp": "2026-07-06 07:54:00"},
    ]

    for m in default_messages:
        if not db.query(models.Message).filter(models.Message.id == m["id"]).first():
            msg = models.Message(
                id=m["id"],
                sender_id=m["sender_id"],
                receiver_id=m["receiver_id"],
                message=m["message"],
                timestamp=datetime.fromisoformat(m["timestamp"])
            )
            db.add(msg)
    print("Sample messages seeded.")

    db.commit()
    print("Seed complete.")
except Exception as exc:
    db.rollback()
    print(f"Seed failed: {exc}")
    sys.exit(1)
finally:
    db.close()

print("\nAll done! Run: uvicorn backend.main:app --reload")

