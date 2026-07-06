from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name            = Column(String(100), nullable=False)
    username        = Column(String(50),  unique=True, index=True, nullable=False)
    gamer_id        = Column(String(50),  unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    sent_messages     = relationship("Message", foreign_keys="Message.sender_id",   back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")


class Game(Base):
    __tablename__ = "games"

    game_id   = Column(String(50),  primary_key=True)
    game_name = Column(String(100), nullable=False)


class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sender_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message     = Column(Text,    nullable=False)
    timestamp   = Column(DateTime, server_default=func.now())

    sender   = relationship("User", foreign_keys=[sender_id],   back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
