import json
import pymysql
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MySQL Credentials
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "gamer_chat")

def dump_mysql():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            dump_data = {"users": [], "games": [], "messages": []}
            
            # 1. Fetch Users
            cursor.execute("SELECT * FROM users")
            users = cursor.fetchall()
            for u in users:
                dump_data["users"].append({
                    "id": u["id"],
                    "name": u["name"],
                    "username": u["username"],
                    "gamer_id": u["gamer_id"],
                    "hashed_password": u["hashed_password"]
                })
                
            # 2. Fetch Games
            cursor.execute("SELECT * FROM games")
            games = cursor.fetchall()
            for g in games:
                dump_data["games"].append({
                    "game_id": g["game_id"],
                    "game_name": g["game_name"]
                })
                
            # 3. Fetch Messages
            cursor.execute("SELECT * FROM messages")
            messages = cursor.fetchall()
            for m in messages:
                dump_data["messages"].append({
                    "id": m["id"],
                    "sender_id": m["sender_id"],
                    "receiver_id": m["receiver_id"],
                    "message": m["message"],
                    # Convert datetime to ISO format string
                    "timestamp": m["timestamp"].isoformat() if isinstance(m["timestamp"], datetime.datetime) else str(m["timestamp"])
                })
                
        with open("mysql_dump.json", "w") as f:
            json.dump(dump_data, f, indent=2)
            
        print(f"Successfully exported {len(dump_data['users'])} users, {len(dump_data['games'])} games, and {len(dump_data['messages'])} messages to mysql_dump.json")
        
    except Exception as e:
        print("Error dumping from MySQL:", e)
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == "__main__":
    print("Dumping data from MySQL...")
    dump_mysql()
