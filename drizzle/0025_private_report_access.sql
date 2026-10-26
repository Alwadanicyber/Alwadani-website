CREATE TABLE IF NOT EXISTS teacher_report_categories(id TEXT PRIMARY KEY,label TEXT NOT NULL,mode TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_report_lock(id INTEGER PRIMARY KEY,pin_salt TEXT NOT NULL,pin_hash TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_report_unlocks(token TEXT PRIMARY KEY,expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_report_lock_attempts(id INTEGER PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
