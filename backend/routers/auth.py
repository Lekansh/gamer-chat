import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


def _generate_gamer_id(username: str) -> str:
    """Create a human-readable gamer tag like  CoolPlayer#4921."""
    suffix = random.randint(1000, 9999)
    return f"{username}#{suffix}"


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check duplicate username
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken.")

    user = models.User(
        name            = payload.name,
        username        = payload.username,
        gamer_id        = _generate_gamer_id(payload.username),
        hashed_password = hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
