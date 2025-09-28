-- 005_create_password_resets.sql
-- Adds a password_resets table for one-time reset tokens

CREATE TABLE IF NOT EXISTS password_resets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(128) NOT NULL,
  expiresAt DATETIME NOT NULL,
  used TINYINT DEFAULT 0,
  createdAt DATETIME NOT NULL,
  INDEX(token_hash),
  INDEX(user_id),
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
