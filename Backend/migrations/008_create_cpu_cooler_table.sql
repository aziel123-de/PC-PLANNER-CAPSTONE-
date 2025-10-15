-- Migration: create cpu_cooler table
CREATE TABLE IF NOT EXISTS cpu_cooler (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  socket VARCHAR(64),
  type VARCHAR(64), -- Air, AIO, Custom Loop
  tdp_rating INT,
  height_mm INT,
  raw JSON
);

-- end of migration