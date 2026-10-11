CREATE TABLE IF NOT EXISTS course_competitions (
  course TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  show_countdown INTEGER NOT NULL DEFAULT 1,
  ends_at TEXT,
  prize TEXT NOT NULL DEFAULT '',
  updated TEXT NOT NULL
);
