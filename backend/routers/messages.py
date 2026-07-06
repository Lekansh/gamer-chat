from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from backend.database import get_db
from backend import models, schemas
from backend.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=schemas.MessageOut, status_code=201)
def send_message(
    payload: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Send a text message to another user."""
    receiver = db.query(models.User).filter(models.User.id == payload.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found.")

    msg = models.Message(
        sender_id   = current_user.id,
        receiver_id = payload.receiver_id,
        message     = payload.message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/history/{other_user_id}", response_model=List[schemas.MessageOut])
def get_history(
    other_user_id: int,
    skip:  int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Fetch the conversation history between the current user and another user,
    ordered oldest → newest.
    """
    messages = (
        db.query(models.Message)
        .filter(
            or_(
                and_(
                    models.Message.sender_id   == current_user.id,
                    models.Message.receiver_id == other_user_id,
                ),
                and_(
                    models.Message.sender_id   == other_user_id,
                    models.Message.receiver_id == current_user.id,
                ),
            )
        )
        .order_by(models.Message.timestamp.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return messages


@router.get("/conversations", response_model=List[schemas.ContactOut])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return users the current user has chatted with, sorted by most recent message."""
    me = current_user.id

    # Get all messages involving the current user
    all_msgs = (
        db.query(models.Message)
        .filter(
            or_(
                models.Message.sender_id   == me,
                models.Message.receiver_id == me,
            )
        )
        .all()
    )

    # Build dicts: other_user_id -> latest timestamp & last message text
    latest_time: dict = {}
    latest_text: dict = {}
    for msg in all_msgs:
        other_id = msg.receiver_id if msg.sender_id == me else msg.sender_id
        if other_id not in latest_time or msg.timestamp > latest_time[other_id]:
            latest_time[other_id] = msg.timestamp
            latest_text[other_id] = msg.message

    if not latest_time:
        return []

    # Fetch users, attach last message info, sort newest first
    users = db.query(models.User).filter(models.User.id.in_(latest_time.keys())).all()
    users.sort(key=lambda u: latest_time[u.id], reverse=True)

    result = []
    for u in users:
        result.append(schemas.ContactOut(
            id=u.id,
            name=u.name,
            username=u.username,
            gamer_id=u.gamer_id,
            last_message=latest_text[u.id],
            last_message_time=latest_time[u.id],
        ))
    return result
