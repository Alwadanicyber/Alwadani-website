CREATE TABLE IF NOT EXISTS student_game_runs(id TEXT PRIMARY KEY,student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,difficulty TEXT NOT NULL,rounds TEXT NOT NULL,state TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,score INTEGER NOT NULL DEFAULT 0,answered INTEGER NOT NULL DEFAULT 0,solved INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'playing',created TEXT NOT NULL,completed TEXT);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_student_game_runs_attempt ON student_game_runs(student,attempt);
