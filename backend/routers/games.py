from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.auth import get_current_user

router = APIRouter(prefix="/games", tags=["Games"])


@router.get("/", response_model=List[schemas.GameOut])
def list_games(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Return all games in the library."""
    return db.query(models.Game).all()


@router.post("/", response_model=schemas.GameOut, status_code=201)
def add_game(
    payload: schemas.GameCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Add a new game to the library."""
    if db.query(models.Game).filter(models.Game.game_id == payload.game_id).first():
        raise HTTPException(status_code=400, detail="Game ID already exists.")
    game = models.Game(game_id=payload.game_id, game_name=payload.game_name)
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


@router.get("/{game_id}", response_model=schemas.GameOut)
def get_game(
    game_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Fetch a single game by ID."""
    game = db.query(models.Game).filter(models.Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found.")
    return game


@router.delete("/{game_id}", status_code=204)
def delete_game(
    game_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Remove a game from the library."""
    game = db.query(models.Game).filter(models.Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found.")
    db.delete(game)
    db.commit()
