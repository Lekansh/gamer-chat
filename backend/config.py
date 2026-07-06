import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

# Prioritize direct DATABASE_URL env variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gamer_chat.db")


# JWT
SECRET_KEY        = os.getenv("SECRET_KEY", "changeme-super-secret-key")
ALGORITHM         = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24   # 1 day

