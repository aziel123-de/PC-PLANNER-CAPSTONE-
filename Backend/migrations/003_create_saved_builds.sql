-- Migration: create saved_builds and saved_build_items
-- Idempotent: safe to run multiple times

CREATE TABLE IF NOT EXISTS saved_builds (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_price INT,
  parts_json JSON NOT NULL,
  warnings_json JSON DEFAULT (JSON_ARRAY()),
  usage_json JSON DEFAULT (JSON_OBJECT()),
  has_issues TINYINT(1) DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_builds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_build_items (
  build_id VARCHAR(36) NOT NULL,
  component_type VARCHAR(32) NOT NULL,
  component_id INT NOT NULL,
  PRIMARY KEY (build_id, component_type, component_id),
  CONSTRAINT fk_saved_build_items_build FOREIGN KEY (build_id) REFERENCES saved_builds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
