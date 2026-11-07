CREATE TABLE IF NOT EXISTS remedial_plans(id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL,definition TEXT NOT NULL,chapter_count INTEGER NOT NULL,published INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 1,created INTEGER NOT NULL,updated INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS remedial_assignments(id TEXT PRIMARY KEY,plan_id TEXT NOT NULL REFERENCES remedial_plans(id),student_name TEXT NOT NULL,code_hash TEXT NOT NULL UNIQUE,code_cipher TEXT NOT NULL,code_hint TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,snapshot TEXT,plan_version INTEGER NOT NULL DEFAULT 0,chapter_count INTEGER NOT NULL DEFAULT 0,next_index INTEGER NOT NULL DEFAULT 0,unlocked_at INTEGER NOT NULL DEFAULT 0,ready_for_exam INTEGER NOT NULL DEFAULT 0,override_index INTEGER NOT NULL DEFAULT -1,version INTEGER NOT NULL DEFAULT 1,run INTEGER NOT NULL DEFAULT 1,last_score INTEGER,last_total INTEGER,created INTEGER NOT NULL,updated INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS remedial_assignments_plan ON remedial_assignments(plan_id,updated);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS remedial_sessions(token_hash TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES remedial_assignments(id),expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS remedial_attempts(id TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES remedial_assignments(id),run INTEGER NOT NULL,chapter_id TEXT NOT NULL,chapter_title TEXT NOT NULL,score INTEGER NOT NULL,total INTEGER NOT NULL,passed INTEGER NOT NULL,detail TEXT NOT NULL,submitted INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS remedial_attempts_student ON remedial_attempts(assignment_id,submitted);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS remedial_login_limits(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
