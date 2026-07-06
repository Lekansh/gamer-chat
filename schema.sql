-- ============================================================
--  Gamer Chat – MySQL Schema  (simple version)
--  Import via MySQL Workbench: Server > Data Import > Run SQL Script
-- ============================================================

CREATE DATABASE IF NOT EXISTS gamer_chat
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gamer_chat;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  NOT NULL,
    gamer_id        VARCHAR(50)  NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_username (username),
    UNIQUE KEY uq_gamer_id (gamer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── games ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
    game_id   VARCHAR(50)  NOT NULL,
    game_name VARCHAR(100) NOT NULL,

    PRIMARY KEY (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── messages ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    sender_id   INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    message     TEXT         NOT NULL,
    timestamp   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_sender   (sender_id),
    KEY idx_receiver (receiver_id),

    CONSTRAINT fk_sender
        FOREIGN KEY (sender_id)   REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_receiver
        FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── seed games ───────────────────────────────────────────────
INSERT IGNORE INTO games (game_id, game_name) VALUES
    ('tictactoe', 'Tic-Tac-Toe'),
    ('rps',       'Rock Paper Scissors'),
    ('memory',    'Memory Match');
