-- Migration: create item_images table for cached image URLs by item name

CREATE TABLE IF NOT EXISTS item_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL DEFAULT 0,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(1024) NOT NULL,
  source_url VARCHAR(1024),
  width INT NULL,
  height INT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'serper',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uniq_item_name (item_id, name),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
