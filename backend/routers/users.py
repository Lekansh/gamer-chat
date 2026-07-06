from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user


@router.get("/", response_model=List[schemas.UserOut])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all registered users (excluding the caller) for the contacts list."""
    users = (
        db.query(models.User)
        .filter(models.User.id != current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return users


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Fetch a single user by ID."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found.")
    return user
