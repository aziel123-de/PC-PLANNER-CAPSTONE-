-- Migration: create case_fans table
CREATE TABLE IF NOT EXISTS case_fans (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  size_mm INT,
  rpm_max INT,
  noise_level_db FLOAT,
  airflow_cfm FLOAT,
  connector VARCHAR(64),
  raw JSON
);

-- end of migration