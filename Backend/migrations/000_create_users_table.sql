-- Migration: create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255),
  firebase_uid VARCHAR(255),
  salt VARCHAR(100),
  hash VARCHAR(255),
  profile_picture TEXT,
  createdAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- end of migration
