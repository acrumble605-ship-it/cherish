import { mkdirSync } from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'cherish.sqlite');

mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    diet TEXT NOT NULL DEFAULT 'Balanced, High-Protein',
    budget_tier TEXT NOT NULL DEFAULT '$',
    priorities_json TEXT NOT NULL DEFAULT '["Health & Longevity","Calorie Control (<500 kcal)"]',
    total_saved_dollars REAL NOT NULL DEFAULT 0,
    meals_decided_count INTEGER NOT NULL DEFAULT 0,
    home_cooked_count INTEGER NOT NULL DEFAULT 0,
    transport_preference TEXT NOT NULL DEFAULT 'walking',
    venue_preference TEXT NOT NULL DEFAULT 'cafe',
    last_lat REAL,
    last_lng REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    decision_type TEXT NOT NULL,
    food_choice TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    factors_considered TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_decisions_user_type_time
    ON decisions(user_id, decision_type, timestamp DESC);

  CREATE INDEX IF NOT EXISTS idx_decisions_type_time
    ON decisions(decision_type, timestamp DESC);
`);
