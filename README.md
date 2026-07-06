# 🎮 GamerChat

A real-time chat app built for gamers — featuring game invites, live messaging, and a sleek dark UI.

## Features

- 🔐 Register / Login with gamer tags
- 💬 Real-time messaging with polling
- 🎮 In-chat game invites (Tic-Tac-Toe, Rock Paper Scissors, Memory Match)
- 📎 Attachment-style game card sharing
- 🔍 Search contacts
- 🕐 Recent chats sorted by latest message timestamp

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Python FastAPI + Uvicorn
- **Database:** MySQL via SQLAlchemy

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend

Open `frontend/index.html` directly in your browser, or serve it with any static server.

> Make sure the backend is running on `http://localhost:8000` before opening the frontend.

## Project Structure

```
gamer_chat/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   └── routers/
│       ├── users.py
│       └── messages.py
└── frontend/
    ├── index.html
    ├── style.css
    ├── app.js
    └── game_*.jpg
```
