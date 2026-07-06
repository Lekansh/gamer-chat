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

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```
3. Set up your MySQL credentials in a `.env` file inside the `backend` folder. You can create it using PowerShell:
   ```powershell
   Set-Content -Path "backend\.env" -Value "DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/gamer_chat" -Encoding utf8
   ```
   Or specify individual parameters:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=gamer_chat
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
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
