from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ─── User ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name:     str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:       int
    name:     str
    username: str
    gamer_id: str

class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:                int
    name:              str
    username:          str
    gamer_id:          str
    last_message:      Optional[str]      = None
    last_message_time: Optional[datetime] = None


# ─── Game ────────────────────────────────────────────────────────────────────

class GameCreate(BaseModel):
    game_id:   str
    game_name: str

class GameOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    game_id:   str
    game_name: str


# ─── Message ─────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    receiver_id: int
    message:     str

class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:          int
    sender_id:   int
    receiver_id: int
    message:     str
    timestamp:   datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"
