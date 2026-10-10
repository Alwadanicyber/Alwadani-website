CREATE TABLE IF NOT EXISTS student_moderation (
  student TEXT PRIMARY KEY REFERENCES students(id),
  removed TEXT NOT NULL
);
