-- Migration: create peripherals tables

CREATE TABLE IF NOT EXISTS keyboard (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  type VARCHAR(64),
  connection VARCHAR(64),
  layout VARCHAR(64),
  backlight VARCHAR(64),
  raw JSON
);

CREATE TABLE IF NOT EXISTS mouse (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  type VARCHAR(64),
  connection VARCHAR(64),
  dpi INT,
  buttons INT,
  raw JSON
);

CREATE TABLE IF NOT EXISTS headset (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  type VARCHAR(64),
  connection VARCHAR(64),
  frequency_response VARCHAR(64),
  microphone VARCHAR(64),
  raw JSON
);

CREATE TABLE IF NOT EXISTS monitor (
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
);

-- end of migration