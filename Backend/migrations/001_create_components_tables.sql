-- Migration: create components tables
CREATE TABLE IF NOT EXISTS mobo (
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
);

CREATE TABLE IF NOT EXISTS cpu (
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
);

CREATE TABLE IF NOT EXISTS gpu (
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
);

CREATE TABLE IF NOT EXISTS psu (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  wattage INT,
  rating VARCHAR(64),
  modular VARCHAR(64),
  raw JSON
);

CREATE TABLE IF NOT EXISTS ram (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  type VARCHAR(64),
  frequency_mhz INT,
  capacity_gb INT,
  raw JSON
);

CREATE TABLE IF NOT EXISTS storage (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  type VARCHAR(64),
  `interface` VARCHAR(64),
  capacity_gb INT,
  power_w INT,
  raw JSON
);

CREATE TABLE IF NOT EXISTS m2 (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  type VARCHAR(64),
  `interface` VARCHAR(64),
  capacity_gb INT,
  power_w INT,
  raw JSON
);

CREATE TABLE IF NOT EXISTS pc_case (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  form_factor VARCHAR(64),
  color VARCHAR(64),
  raw JSON
);

-- end of migration
