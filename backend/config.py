import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

# Prioritize direct DATABASE_URL env variable
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to building it from individual parameters
    DB_HOST     = os.getenv("DB_HOST", "localhost")
    DB_PORT     = os.getenv("DB_PORT", "3306")
    DB_USER     = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME     = os.getenv("DB_NAME", "gamer_chat")
    
    # URL-encode password so special chars like @ don't break the connection string
    DATABASE_URL = (
        f"mysql+pymysql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

# JWT
SECRET_KEY        = os.getenv("SECRET_KEY", "changeme-super-secret-key")
ALGORITHM         = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24   # 1 day

