// table_queries.js
// Central definition of all tables for idempotent creation.
// NOTE: This uses the original simpler ERD with saved_build_items (generic junction)
// alongside component tables. If you want the newer granular per-type build tables
// keep those in separate migrations.

const tableQueries = {
  users: `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255),
    firebase_uid VARCHAR(255),
    salt VARCHAR(100),
    hash VARCHAR(255),
    profile_picture TEXT,
    createdAt DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  mobo: `CREATE TABLE IF NOT EXISTS mobo (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    socket VARCHAR(64),
    chipset VARCHAR(64),
    form_factor VARCHAR(64),
    ram_type VARCHAR(64),
    ram_slots INT,
    gpu_slots INT,
    storage_slots INT,
    m2_slots INT,
    raw JSON
  );`,

  cpu: `CREATE TABLE IF NOT EXISTS cpu (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    socket VARCHAR(64),
    cores INT,
    threads INT,
    base_clock_ghz FLOAT,
    boost_clock_ghz FLOAT,
    tdp INT,
    max_tdp INT,
    ram_type VARCHAR(64),
    ram_max INT,
    cache_mb INT,
    raw JSON
  );`,

  gpu: `CREATE TABLE IF NOT EXISTS gpu (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    vram_gb INT,
    power_draw_w INT,
    boost_freq_mhz INT,
    cuda_cores INT,
    compute_units INT,
    xe_cores INT,
    raw JSON
  );`,

  psu: `CREATE TABLE IF NOT EXISTS psu (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    wattage INT,
    rating VARCHAR(64),
    modular VARCHAR(64),
    raw JSON
  );`,

  ram: `CREATE TABLE IF NOT EXISTS ram (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    type VARCHAR(64),
    frequency_mhz INT,
    capacity_gb INT,
    raw JSON
  );`,

  storage: `CREATE TABLE IF NOT EXISTS storage (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    type VARCHAR(64),
    \`interface\` VARCHAR(64),
    capacity_gb INT,
    power_w INT,
    raw JSON
  );`,

  m2: `CREATE TABLE IF NOT EXISTS m2 (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    type VARCHAR(64),
    \`interface\` VARCHAR(64),
    capacity_gb INT,
    power_w INT,
    raw JSON
  );`,

  pc_case: `CREATE TABLE IF NOT EXISTS pc_case (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    form_factor VARCHAR(64),
    color VARCHAR(64),
    raw JSON
  );`,

  cpu_cooler: `CREATE TABLE IF NOT EXISTS cpu_cooler (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    socket VARCHAR(64),
    type VARCHAR(64),
    tdp_rating INT,
    height_mm INT,
    raw JSON
  );`,

  case_fans: `CREATE TABLE IF NOT EXISTS case_fans (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    size_mm INT,
    rpm_max INT,
    noise_level_db FLOAT,
    airflow_cfm FLOAT,
    connector VARCHAR(64),
    raw JSON
  );`,

  keyboard: `CREATE TABLE IF NOT EXISTS keyboard (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    type VARCHAR(64),
    connection VARCHAR(64),
    layout VARCHAR(64),
    backlight VARCHAR(64),
    raw JSON
  );`,

  mouse: `CREATE TABLE IF NOT EXISTS mouse (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    type VARCHAR(64),
    connection VARCHAR(64),
    dpi INT,
    buttons INT,
    raw JSON
  );`,

  headset: `CREATE TABLE IF NOT EXISTS headset (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price INT,
    type VARCHAR(64),
    connection VARCHAR(64),
    frequency_response VARCHAR(64),
    microphone VARCHAR(64),
    raw JSON
  );`,

  monitor: `CREATE TABLE IF NOT EXISTS monitor (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(64),
    price INT,
    size_inches FLOAT,
    resolution VARCHAR(64),
    refresh_rate INT,
    panel_type VARCHAR(64),
    connection VARCHAR(64),
    raw JSON
  );`,

  saved_builds: `CREATE TABLE IF NOT EXISTS saved_builds (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_price INT,
    parts_json JSON NOT NULL,
    warnings_json JSON DEFAULT (JSON_ARRAY()),
    has_issues TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_builds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  saved_build_items: `CREATE TABLE IF NOT EXISTS saved_build_items (
    build_id VARCHAR(36) NOT NULL,
    component_type VARCHAR(32) NOT NULL,
    component_id INT NOT NULL,
    PRIMARY KEY (build_id, component_type, component_id),
    CONSTRAINT fk_saved_build_items_build FOREIGN KEY (build_id) REFERENCES saved_builds(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  password_resets: `CREATE TABLE IF NOT EXISTS password_resets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    expiresAt DATETIME NOT NULL,
    used TINYINT DEFAULT 0,
    createdAt DATETIME NOT NULL,
    INDEX(token_hash),
    INDEX(user_id),
    CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  community_builds: `CREATE TABLE IF NOT EXISTS community_builds (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    parts_json JSON NOT NULL,
    total_price INT DEFAULT 0,
    up_votes INT DEFAULT 0,
    down_votes INT DEFAULT 0,
    build_image TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    INDEX(user_id),
    CONSTRAINT fk_community_builds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  community_build_comments: `CREATE TABLE IF NOT EXISTS community_build_comments (
    id VARCHAR(36) PRIMARY KEY,
    build_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    comment_text VARCHAR(600) NOT NULL,
    createdAt DATETIME NOT NULL,
    INDEX(build_id),
    INDEX(user_id),
    CONSTRAINT fk_cbc_build FOREIGN KEY (build_id) REFERENCES community_builds(id) ON DELETE CASCADE,
    CONSTRAINT fk_cbc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  community_build_votes: `CREATE TABLE IF NOT EXISTS community_build_votes (
    build_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    direction ENUM('up','down') NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    PRIMARY KEY (build_id, user_id),
    INDEX(user_id),
    CONSTRAINT fk_cbv_build FOREIGN KEY (build_id) REFERENCES community_builds(id) ON DELETE CASCADE,
    CONSTRAINT fk_cbv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  item_images: `CREATE TABLE IF NOT EXISTS item_images (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
};

module.exports = { tableQueries };