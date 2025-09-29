-- Add Firebase integration support to users table
ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255);
ALTER TABLE users MODIFY salt VARCHAR(100);
ALTER TABLE users MODIFY hash VARCHAR(255);