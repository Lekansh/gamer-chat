import json
from datetime import datetime
from sqlalchemy import create_engine
from backend.database import Base
from backend.models import User, Game, Message

print("Initializing SQLite database and migrating records...")
# Point to local sqlite database in the project root
engine = create_engine("sqlite:///./gamer_chat.db", connect_args={"check_same_thread": False})

# Create tables
Base.metadata.create_all(bind=engine)

# Load backup
try:
    with open("mysql_dump.json", "r") as f:
        data = json.load(f)
except FileNotFoundError:
    print("Error: mysql_dump.json not found. Run export first.")
    exit(1)

from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind=engine)
session = Session()

try:
    # 1. Migrate Users
    print(f"Migrating {len(data['users'])} users...")
    for u in data["users"]:
        # Check if already exists
        exists = session.query(User).filter_by(id=u["id"]).first()
        if not exists:
            user = User(
                id=u["id"],
                name=u["name"],
                username=u["username"],
                gamer_id=u["gamer_id"],
                hashed_password=u["hashed_password"]
            )
            session.add(user)
            
    # 2. Migrate Games
    print(f"Migrating {len(data['games'])} games...")
    for g in data["games"]:
        exists = session.query(Game).filter_by(game_id=g["game_id"]).first()
        if not exists:
            game = Game(
                game_id=g["game_id"],
                game_name=g["game_name"]
            )
            session.add(game)
            
    # 3. Migrate Messages
    print(f"Migrating {len(data['messages'])} messages...")
    for m in data["messages"]:
        exists = session.query(Message).filter_by(id=m["id"]).first()
        if not exists:
            # Parse timestamp string back to datetime
            dt = datetime.fromisoformat(m["timestamp"])
            msg = Message(
                id=m["id"],
                sender_id=m["sender_id"],
                receiver_id=m["receiver_id"],
                message=m["message"],
                timestamp=dt
            )
            session.add(msg)
            
    session.commit()
    print("Successfully completed migration to SQLite database (gamer_chat.db)!")
except Exception as e:
    session.rollback()
    print("Migration failed:", e)
finally:
    session.close()
