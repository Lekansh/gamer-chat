/* C:\Users\My Pc\.gemini\antigravity\scratch\gamer_chat\frontend\app.js */

const API_BASE = window.location.origin;

// State Management
let token = localStorage.getItem("token") || "";
let currentUser = null;
let contacts = []; // only users chatted with
let allUsers = []; // all system users for searching
let activeContact = null;
let chatMessages = [];
let pollingInterval = null;
let activeGame = null; // { type, state, challengerId, receiverId, status }

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchResultsOverlay = document.getElementById("search-results-overlay");
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");

// Auth Inputs
const loginUser = document.getElementById("login-username");
const loginPass = document.getElementById("login-password");
const regName = document.getElementById("reg-name");
const regUser = document.getElementById("reg-username");
const regPass = document.getElementById("reg-password");

// App Profile Elements
const myAvatar = document.getElementById("my-avatar");
const myName = document.getElementById("my-name");
const myGamerId = document.getElementById("my-gamer-id");
const logoutBtn = document.getElementById("logout-btn");
const contactsList = document.getElementById("contacts-list");

// Chat Elements
const welcomeScreen = document.getElementById("welcome-screen");
const chatInterface = document.getElementById("chat-interface");
const activeAvatar = document.getElementById("active-avatar");
const activeName = document.getElementById("active-name");
const activeGamerId = document.getElementById("active-gamer-id");
const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const attachBtn = document.getElementById("attach-btn");
const gamePicker = document.getElementById("game-picker");

// Game Cards (inside picker)
const challengeTtt    = document.getElementById("challenge-ttt");
const challengeRps    = document.getElementById("challenge-rps");
const challengeMemory = document.getElementById("challenge-memory");

// Game Modal Elements
const gameModal = document.getElementById("game-modal");
const gameTitle = document.getElementById("game-title");
const gameStatus = document.getElementById("game-status");
const closeGameBtn = document.getElementById("close-game-btn");
const tictactoeBoard = document.getElementById("tictactoe-board");
const rpsBoard = document.getElementById("rps-board");
const memoryBoard = document.getElementById("memory-board");

// Helper: Show custom visual notifications/toast
function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "1rem 1.5rem";
  toast.style.borderRadius = "12px";
  toast.style.color = "#fff";
  toast.style.fontFamily = "'Outfit', sans-serif";
  toast.style.fontSize = "0.95rem";
  toast.style.fontWeight = "600";
  toast.style.zIndex = "1000";
  toast.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
  toast.style.transition = "all 0.3s ease";
  
  if (type === "success") {
    toast.style.background = "linear-gradient(135deg, #06b6d4, #10b981)";
  } else {
    toast.style.background = "linear-gradient(135deg, #ec4899, #ef4444)";
  }
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── AUTH FLOW ──────────────────────────────────────────────────────────────

toRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  registerForm.style.display = "block";
  document.getElementById("auth-subtitle-text").innerText = "Join the arena & start playing";
});

toLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "none";
  loginForm.style.display = "block";
  document.getElementById("auth-subtitle-text").innerText = "Connect with players & play mini-games";
});

// Login submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginUser.value.trim(),
        password: loginPass.value
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Authentication failed");
    
    token = data.access_token;
    localStorage.setItem("token", token);
    loginUser.value = "";
    loginPass.value = "";
    showToast("Successfully signed in!", "success");
    initApp();
  } catch (err) {
    showToast(err.message);
  }
});

// Register submit
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regName.value.trim(),
        username: regUser.value.trim(),
        password: regPass.value
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    
    // Auto login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: regUser.value.trim(),
        password: regPass.value
      })
    });
    const loginData = await loginRes.json();
    
    token = loginData.access_token;
    localStorage.setItem("token", token);
    
    regName.value = "";
    regUser.value = "";
    regPass.value = "";
    
    showToast("Account created successfully!", "success");
    initApp();
  } catch (err) {
    showToast(err.message);
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  token = "";
  currentUser = null;
  activeContact = null;
  clearInterval(pollingInterval);
  pollingInterval = null;
  
  appContainer.style.display = "none";
  authContainer.style.display = "block";
  loginForm.style.display = "block";
  registerForm.style.display = "none";
});

// ─── MAIN APPLICATION INITIALIZATION ────────────────────────────────────────

async function initApp() {
  if (!token) return;
  
  try {
    // Get current user profile
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.status === 401) {
      logoutBtn.click();
      return;
    }
    
    currentUser = await res.json();
    
    // Update profile view
    myAvatar.innerText = currentUser.name.charAt(0).toUpperCase();
    myName.innerText = currentUser.name;
    myGamerId.innerText = currentUser.gamer_id;
    
    authContainer.style.display = "none";
    appContainer.style.display = "grid";
    
    // Get contacts list
    await fetchContacts();
    
  } catch (err) {
    showToast("Error initializing app: " + err.message);
  }
}

async function fetchContacts() {
  try {
    // 1. Fetch only active conversations (people we chatted with)
    const resConvs = await fetch(`${API_BASE}/messages/conversations`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!resConvs.ok) throw new Error("Could not fetch active chats");
    contacts = await resConvs.json();
    renderContacts();

    // 2. Fetch all users in background for search lookup
    const resUsers = await fetch(`${API_BASE}/users/`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (resUsers.ok) {
      allUsers = await resUsers.json();
    }
  } catch (err) {
    showToast(err.message);
  }
}

function formatContactTime(isoStr) {
  if (!isoStr) return "";
  const date = new Date(isoStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function renderContacts() {
  contactsList.innerHTML = "";
  contacts.forEach(contact => {
    const card = document.createElement("div");
    card.className = `contact-card ${activeContact && activeContact.id === contact.id ? "active" : ""}`;

    // Last message: hide game protocol messages
    let preview = contact.last_message || "";
    if (preview.startsWith("__GAME__:")) preview = "🎮 Game message";
    if (preview.length > 32) preview = preview.slice(0, 32) + "…";

    const timeStr = formatContactTime(contact.last_message_time);

    card.innerHTML = `
      <div class="avatar">${contact.name.charAt(0).toUpperCase()}</div>
      <div class="user-info">
        <div class="contact-top-row">
          <div class="user-display-name">${contact.name}</div>
          ${timeStr ? `<div class="contact-time">${timeStr}</div>` : ""}
        </div>
        <div class="contact-last-msg">${preview}</div>
      </div>
    `;
    card.addEventListener("click", () => selectContact(contact));
    contactsList.appendChild(card);
  });
}

function selectContact(contact) {
  activeContact = contact;
  renderContacts();
  
  welcomeScreen.style.display = "none";
  chatInterface.style.display = "flex";
  
  activeAvatar.innerText = contact.name.charAt(0).toUpperCase();
  activeName.innerText = contact.name;
  activeGamerId.innerText = contact.gamer_id;
  
  messagesContainer.innerHTML = "";
  chatMessages = [];
  activeGame = null;
  closeGameModal();
  
  // Set up Polling Loop (Every 2 seconds)
  if (pollingInterval) clearInterval(pollingInterval);
  fetchMessages();
  pollingInterval = setInterval(fetchMessages, 2000);
}

// ─── MESSAGING & GAME PROTOCOL ──────────────────────────────────────────────

async function fetchMessages() {
  if (!activeContact) return;
  
  try {
    const res = await fetch(`${API_BASE}/messages/history/${activeContact.id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load message history");
    
    const messages = await res.json();
    
    // Check if there are new messages
    if (messages.length !== chatMessages.length) {
      chatMessages = messages;
      renderMessages();
      processGameProtocol();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderMessages() {
  const shouldScroll = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 100;
  messagesContainer.innerHTML = "";
  
  chatMessages.forEach(msg => {
    const isSent = msg.sender_id === currentUser.id;
    const isGame = msg.message.startsWith("__GAME__:");
    
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper ${isSent ? "sent" : "received"}`;
    
    if (isGame) {
      let payload;
      try {
        payload = JSON.parse(msg.message.substring(9));
      } catch (e) {
        payload = null;
      }
      
      if (payload) {
        if (payload.type === "challenge") {
          const card = document.createElement("div");
          card.className = "game-card-msg";
          
          const gameEmojis = {
            tictactoe: "❌",
            rps: "✊",
            memory: "🃏"
          };
          const gameTitleStr = payload.game_id === "tictactoe" ? "Tic-Tac-Toe" : payload.game_id === "rps" ? "Rock Paper Scissors" : "Memory Match";
          const emoji = gameEmojis[payload.game_id] || "🎮";
          
          card.innerHTML = `
            <div class="game-card-emoji" style="font-size: 3rem; text-align: center; margin-bottom: 0.5rem;">${emoji}</div>
            <div class="game-card-title" style="font-weight: 600; text-align: center;">${gameTitleStr}</div>
          `;
          
          if (!isSent && payload.status === "pending") {
            const acceptBtn = document.createElement("button");
            acceptBtn.className = "game-card-btn";
            acceptBtn.innerText = "Play Now";
            acceptBtn.onclick = () => acceptGameChallenge(payload.game_id, msg.id);
            card.appendChild(acceptBtn);
          } else if (payload.status === "accepted") {
            const playBtn = document.createElement("button");
            playBtn.className = "game-card-btn";
            playBtn.innerText = "Open Board";
            playBtn.onclick = () => openGameInterface(payload.game_id);
            card.appendChild(playBtn);
          }
          
          wrapper.appendChild(card);
        } else {
          // Hide actual moves/accepts from the primary chat log to keep the UI beautiful
          return;
        }
      }
    } else {
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      bubble.innerText = msg.message;
      wrapper.appendChild(bubble);
    }
    
    // Time label
    const time = document.createElement("span");
    time.className = "message-time";
    const date = new Date(msg.timestamp);
    time.innerText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrapper.appendChild(time);
    
    messagesContainer.appendChild(wrapper);
  });
  
  if (shouldScroll) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

async function sendMessage(text) {
  if (!text.trim() || !activeContact) return;
  
  try {
    const res = await fetch(`${API_BASE}/messages/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        receiver_id: activeContact.id,
        message: text
      })
    });
    
    if (!res.ok) throw new Error("Could not send message");
    const newMsg = await res.json();

    // Update the contact's last message preview locally, then bubble to top
    activeContact.last_message      = text;
    activeContact.last_message_time = newMsg.timestamp;
    contacts = contacts.filter(c => c.id !== activeContact.id);
    contacts.unshift(activeContact);
    renderContacts();

    chatMessages.push(newMsg);
    renderMessages();
    processGameProtocol();
  } catch (err) {
    showToast(err.message);
  }
}

sendBtn.addEventListener("click", () => {
  sendMessage(messageInput.value);
  messageInput.value = "";
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage(messageInput.value);
    messageInput.value = "";
  }
});

// ─── ATTACH BUTTON / GAME PICKER TOGGLE ─────────────────────────────────────

attachBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = gamePicker.classList.toggle("open");
  attachBtn.classList.toggle("open", isOpen);
});

// Close picker when clicking outside
document.addEventListener("click", (e) => {
  if (!gamePicker.contains(e.target) && e.target !== attachBtn) {
    gamePicker.classList.remove("open");
    attachBtn.classList.remove("open");
  }
});

// ─── GAME STATE MACHINE & REPLAY LOGIC ──────────────────────────────────────

async function sendGameMessage(data) {
  await sendMessage(`__GAME__:${JSON.stringify(data)}`);
}

function closeGamePicker() {
  gamePicker.classList.remove("open");
  attachBtn.classList.remove("open");
}

// Game Card click triggers
challengeTtt.addEventListener("click", () => {
  closeGamePicker();
  sendGameMessage({ type: "challenge", game_id: "tictactoe", status: "pending" });
});

challengeRps.addEventListener("click", () => {
  closeGamePicker();
  sendGameMessage({ type: "challenge", game_id: "rps", status: "pending" });
});

challengeMemory.addEventListener("click", () => {
  closeGamePicker();
  sendGameMessage({ type: "challenge", game_id: "memory", status: "pending" });
});

// Accept a game challenge
async function acceptGameChallenge(gameId, msgId) {
  // To update challenge status locally and synchronization, we send accept move
  // Wait, memory game needs a seeded board
  let extraData = {};
  if (gameId === "memory") {
    const emojis = ["🍎", "🍌", "🍇", "🍒", "🥝", "🍉", "🍑", "🍍"];
    // Double them and shuffle
    let board = [...emojis, ...emojis];
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
    extraData.grid = board;
  }
  
  await sendGameMessage({
    type: "accept",
    game_id: gameId,
    ...extraData
  });
  
  openGameInterface(gameId);
}

// Check recent game commands in chatMessages to build active game state
function processGameProtocol() {
  let challengeMsg = null;
  
  // 1. Find latest game challenge
  for (let i = chatMessages.length - 1; i >= 0; i--) {
    const msg = chatMessages[i];
    if (msg.message.startsWith("__GAME__:")) {
      try {
        const payload = JSON.parse(msg.message.substring(9));
        if (payload.type === "challenge") {
          challengeMsg = msg;
          challengeMsg.payload = payload;
          break;
        }
      } catch (e) {}
    }
  }
  
  if (!challengeMsg) {
    activeGame = null;
    return;
  }
  
  const payload = challengeMsg.payload;
  const gameId = payload.game_id;
  
  // 2. Scan all messages after the challenge to build final board state
  let accepted = false;
  let moves = [];
  let boardGrid = null; // for memory game
  
  const startIndex = chatMessages.indexOf(challengeMsg);
  for (let i = startIndex + 1; i < chatMessages.length; i++) {
    const msg = chatMessages[i];
    if (msg.message.startsWith("__GAME__:")) {
      try {
        const p = JSON.parse(msg.message.substring(9));
        if (p.game_id === gameId) {
          if (p.type === "accept") {
            accepted = true;
            if (p.grid) boardGrid = p.grid;
          } else if (p.type === "move") {
            moves.push({
              senderId: msg.sender_id,
              data: p
            });
          }
        }
      } catch (e) {}
    }
  }
  
  activeGame = {
    gameId: gameId,
    challengerId: challengeMsg.sender_id,
    receiverId: challengeMsg.receiver_id,
    accepted: accepted,
    moves: moves,
    boardGrid: boardGrid
  };
  
  // If the game modal is open, refresh board view
  if (gameModal.style.display === "flex") {
    renderGameBoard();
  }
}

function openGameInterface(gameId) {
  gameModal.style.display = "flex";
  
  // Hide all boards
  tictactoeBoard.style.display = "none";
  rpsBoard.style.display = "none";
  memoryBoard.style.display = "none";
  
  if (gameId === "tictactoe") {
    gameTitle.innerText = "Tic-Tac-Toe";
    tictactoeBoard.style.display = "grid";
  } else if (gameId === "rps") {
    gameTitle.innerText = "Rock Paper Scissors";
    rpsBoard.style.display = "flex";
  } else if (gameId === "memory") {
    gameTitle.innerText = "Memory Match";
    memoryBoard.style.display = "grid";
  }
  
  renderGameBoard();
}

function closeGameModal() {
  gameModal.style.display = "none";
}

closeGameBtn.addEventListener("click", closeGameModal);

// ─── GAME-SPECIFIC RENDER & ACTION LOGIC ────────────────────────────────────

function renderGameBoard() {
  if (!activeGame) {
    gameStatus.innerText = "No active game challenge found.";
    return;
  }
  
  const meId = currentUser.id;
  const isChallenger = meId === activeGame.challengerId;
  
  if (!activeGame.accepted) {
    gameStatus.innerText = "Waiting for challenge to be accepted...";
    return;
  }
  
  if (activeGame.gameId === "tictactoe") {
    runTicTacToe(meId, isChallenger);
  } else if (activeGame.gameId === "rps") {
    runRps(meId, isChallenger);
  } else if (activeGame.gameId === "memory") {
    runMemoryMatch(meId, isChallenger);
  }
}

// 1. TIC-TAC-TOE GAME ENGINE
function runTicTacToe(meId, isChallenger) {
  let board = Array(9).fill(null);
  
  // Replay moves
  activeGame.moves.forEach(move => {
    const isMoveChallenger = move.senderId === activeGame.challengerId;
    board[move.data.cell] = isMoveChallenger ? "X" : "O";
  });
  
  // Check winner
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  let winner = null;
  for (let line of winLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a];
      break;
    }
  }
  
  const isDraw = !winner && board.every(cell => cell !== null);
  
  // Turn calculation: challenger is X (moves 0, 2, 4, 6, 8), receiver is O (moves 1, 3, 5, 7)
  const totalMoves = activeGame.moves.length;
  const myTurn = !winner && !isDraw && (
    (totalMoves % 2 === 0 && isChallenger) || // challenger's turn
    (totalMoves % 2 === 1 && !isChallenger)   // receiver's turn
  );
  
  // Update cells visual
  const cells = tictactoeBoard.children;
  for (let i = 0; i < 9; i++) {
    cells[i].className = "tictactoe-cell";
    cells[i].innerText = board[i] || "";
    if (board[i] === "X") cells[i].classList.add("x");
    if (board[i] === "O") cells[i].classList.add("o");
    
    // Clear old click handlers
    const newCell = cells[i].cloneNode(true);
    cells[i].parentNode.replaceChild(newCell, cells[i]);
    
    if (myTurn && board[i] === null) {
      newCell.addEventListener("click", () => {
        sendGameMessage({
          type: "move",
          game_id: "tictactoe",
          cell: i
        });
      });
    }
  }
  
  // Render status
  if (winner) {
    const winPlayer = winner === "X" ? "Challenger" : "Opponent";
    const amIWinner = (winner === "X" && isChallenger) || (winner === "O" && !isChallenger);
    gameStatus.innerText = amIWinner ? "🎉 You Won the Game!" : `💀 Opponent won!`;
  } else if (isDraw) {
    gameStatus.innerText = "🤝 It's a draw!";
  } else {
    gameStatus.innerText = myTurn ? "🟢 Your turn (Play your move)" : "⏳ Opponent's turn...";
  }
}

// 2. ROCK PAPER SCISSORS GAME ENGINE
function runRps(meId, isChallenger) {
  let myMove = null;
  let opponentMove = null;
  
  activeGame.moves.forEach(move => {
    if (move.senderId === meId) {
      myMove = move.data.choice;
    } else {
      opponentMove = move.data.choice;
    }
  });
  
  // Visual buttons highlight
  const rpsButtons = rpsBoard.querySelectorAll(".rps-btn");
  rpsButtons.forEach(btn => {
    const choice = btn.dataset.choice;
    btn.className = "rps-btn";
    if (choice === myMove) {
      btn.classList.add("selected");
    }
    
    // Clear old click handlers
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    if (!myMove) {
      newBtn.addEventListener("click", () => {
        sendGameMessage({
          type: "move",
          game_id: "rps",
          choice: choice
        });
      });
    }
  });
  
  // RPS Resolution Logic
  if (myMove && opponentMove) {
    let result = "";
    if (myMove === opponentMove) {
      result = "🤝 It's a Tie!";
    } else if (
      (myMove === "rock" && opponentMove === "scissors") ||
      (myMove === "paper" && opponentMove === "rock") ||
      (myMove === "scissors" && opponentMove === "paper")
    ) {
      result = "🎉 You Win! Opponent chose " + opponentMove.toUpperCase();
    } else {
      result = "💀 You Lose! Opponent chose " + opponentMove.toUpperCase();
    }
    gameStatus.innerHTML = `${result}<br><span style="font-size:0.8rem;color:var(--text-muted)">Challenge again from chat window to replay</span>`;
  } else if (myMove) {
    gameStatus.innerText = "⏳ Waiting for opponent to select their move...";
  } else {
    gameStatus.innerText = "🟢 Choose Rock, Paper, or Scissors!";
  }
}

// 3. MEMORY MATCH GAME ENGINE
function runMemoryMatch(meId, isChallenger) {
  const grid = activeGame.boardGrid;
  if (!grid) {
    gameStatus.innerText = "Error: Memory board was not initialized correctly.";
    return;
  }
  
  // Replay moves to calculate score, turn, and matched cards
  let matchedIndices = new Set();
  let missAnimations = []; // cards to blink hide
  let scores = {}; // playerId -> score
  scores[activeGame.challengerId] = 0;
  scores[activeGame.receiverId] = 0;
  
  let currentTurnPlayer = activeGame.challengerId; // Challenger starts
  
  activeGame.moves.forEach((move, moveIdx) => {
    if (move.data.match) {
      const [idx1, idx2] = move.data.match;
      matchedIndices.add(idx1);
      matchedIndices.add(idx2);
      scores[move.senderId] = (scores[move.senderId] || 0) + 1;
      // Player who matches keeps the turn
      currentTurnPlayer = move.senderId;
    } else if (move.data.miss) {
      // If it's the very last move, we can render the blink anim for misses
      if (moveIdx === activeGame.moves.length - 1) {
        missAnimations = move.data.miss;
      }
      // Pass turn to the other player
      currentTurnPlayer = move.senderId === activeGame.challengerId ? activeGame.receiverId : activeGame.challengerId;
    }
  });
  
  const myTurn = currentTurnPlayer === meId;
  
  // Render memory match board cards
  memoryBoard.innerHTML = "";
  
  // Track client-side local first/second click during turn
  let firstFlippedIndex = null;
  
  for (let i = 0; i < 16; i++) {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.index = i;
    
    // Check state of card
    const isMatched = matchedIndices.has(i);
    const isMissBlink = missAnimations.includes(i);
    
    if (isMatched) {
      card.classList.add("matched");
      card.innerText = grid[i];
    } else if (isMissBlink) {
      card.classList.add("flipped");
      card.innerText = grid[i];
      // Flip back after delay visually
      setTimeout(() => {
        card.classList.remove("flipped");
        card.innerText = "";
      }, 1500);
    }
    
    // Click handling
    card.addEventListener("click", () => {
      if (!myTurn || isMatched || card.classList.contains("flipped") || firstFlippedIndex === i) return;
      
      // Flip locally
      card.classList.add("flipped");
      card.innerText = grid[i];
      
      if (firstFlippedIndex === null) {
        firstFlippedIndex = i;
      } else {
        // Second card flipped, evaluate match
        const idx1 = firstFlippedIndex;
        const idx2 = i;
        firstFlippedIndex = null; // reset
        
        if (grid[idx1] === grid[idx2]) {
          // It's a match!
          sendGameMessage({
            type: "move",
            game_id: "memory",
            match: [idx1, idx2]
          });
        } else {
          // Miss!
          sendGameMessage({
            type: "move",
            game_id: "memory",
            miss: [idx1, idx2]
          });
        }
      }
    });
    
    memoryBoard.appendChild(card);
  }
  
  // Render Status and Score
  const myScore = scores[meId] || 0;
  const oppScore = scores[meId === activeGame.challengerId ? activeGame.receiverId : activeGame.challengerId] || 0;
  
  const isGameOver = matchedIndices.size === 16;
  if (isGameOver) {
    if (myScore > oppScore) {
      gameStatus.innerText = `🎉 You Won! Score: ${myScore} vs ${oppScore}`;
    } else if (myScore < oppScore) {
      gameStatus.innerText = `💀 You Lost! Score: ${myScore} vs ${oppScore}`;
    } else {
      gameStatus.innerText = `🤝 It's a Tie! Score: ${myScore} - ${oppScore}`;
    }
  } else {
    gameStatus.innerHTML = `
      Score: You (${myScore}) - Opponent (${oppScore})<br>
      ${myTurn ? "🟢 Your turn (Flip 2 cards)" : "⏳ Opponent is flipping..."}
    `;
  }
}

// ─── SEARCH & FILTER USERS ──────────────────────────────────────────────────
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();
  if (!query) {
    searchResultsOverlay.style.display = "none";
    searchResultsOverlay.innerHTML = "";
    return;
  }

  // Filter users who match the query, are NOT the current user
  const matches = allUsers.filter(u => {
    const isMe = u.id === currentUser.id;
    const matchesName = u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query) || u.gamer_id.toLowerCase().includes(query);
    return !isMe && matchesName;
  });

  if (matches.length === 0) {
    searchResultsOverlay.innerHTML = `<div style="padding: 0.85rem; color: var(--text-muted); font-size: 0.85rem; text-align: center;">No gamers found</div>`;
  } else {
    searchResultsOverlay.innerHTML = "";
    matches.forEach(user => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <div class="user-display-name" style="font-size: 0.85rem;">${user.name}</div>
          <div class="user-gamer-tag" style="font-size: 0.75rem;">${user.gamer_id}</div>
        </div>
      `;
      item.addEventListener("click", () => {
        // Select this user for chat (will start as a new conversation)
        selectContact(user);
        
        // Clear search input and hide overlay
        searchInput.value = "";
        searchResultsOverlay.style.display = "none";
        searchResultsOverlay.innerHTML = "";
      });
      searchResultsOverlay.appendChild(item);
    });
  }
  searchResultsOverlay.style.display = "block";
});

// Close search dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !searchResultsOverlay.contains(e.target)) {
    searchResultsOverlay.style.display = "none";
  }
});

// ─── STARTUP CHECK ──────────────────────────────────────────────────────────
if (token) {
  initApp();
} else {
  authContainer.style.display = "block";
  appContainer.style.display = "none";
}
