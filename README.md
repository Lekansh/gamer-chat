# 🎮 GamerChat

A real-time chat app built for gamers — featuring game invites, live messaging, and a sleek dark UI.

## Features

- 🔐 Register / Login with gamer tags
- 💬 Real-time messaging with polling
- 🎮 In-chat game sharing (Tic-Tac-Toe, Rock Paper Scissors, Memory Match)
- 📎 Attachment-style game card sharing
- 🔍 Search contacts
- 🕐 Recent chats sorted by latest message timestamp

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Python FastAPI + Uvicorn
- **Database:** SQLite via SQLAlchemy

## Setup

It's super easy to get started! There are no database servers or passwords to configure. The repository includes a pre-populated SQLite database so your chats and accounts are ready to go.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lekansh/gamer-chat.git
   cd gamer-chat
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the application:**
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

5. **Open the App:**
   Open your browser and navigate to [http://localhost:8000](http://localhost:8000)

## Project Structure

```
gamer_chat/
├── backend/
│   ├── main.py (Entry point & serves frontend)
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── config.py
│   └── routers/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── gamer_chat.db (Pre-populated SQLite DB)
├── seed_db.py (Optional test data script)
└── requirements.txt
```
