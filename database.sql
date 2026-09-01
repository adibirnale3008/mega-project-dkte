-- Create Database
CREATE DATABASE IF NOT EXISTS fake_news_db;
USE fake_news_db;

-- Create `users` Table (supports both Google OAuth and local email/password auth)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    profile_picture VARCHAR(500),
    password_hash VARCHAR(255) NULL,
    auth_provider ENUM('google', 'local') NOT NULL DEFAULT 'google',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create `news_checks` Table
CREATE TABLE IF NOT EXISTS news_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_text TEXT NOT NULL,
    prediction ENUM('Fake', 'Real') DEFAULT NULL,
    confidence FLOAT DEFAULT NULL,
    api_verification VARCHAR(255) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_summary TEXT DEFAULT NULL,
    credibility_score INT DEFAULT 50,
    claim_category VARCHAR(50) DEFAULT 'Other',
    user_id INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- MIGRATION: Run these if you have an existing `users` table
-- (Skip if you're creating the database fresh)
-- ============================================================
-- ALTER TABLE users MODIFY google_id VARCHAR(255) UNIQUE NULL;
-- ALTER TABLE users MODIFY email VARCHAR(255) NOT NULL, ADD UNIQUE INDEX idx_email (email);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL AFTER profile_picture;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider ENUM('google','local') NOT NULL DEFAULT 'google' AFTER password_hash;
