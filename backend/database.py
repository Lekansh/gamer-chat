from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from backend.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # auto-reconnect on stale connections
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Dependency – use in router functions with:  db: Session = Depends(get_db)
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
