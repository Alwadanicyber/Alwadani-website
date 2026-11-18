CREATE TABLE IF NOT EXISTS teacher_portfolio_profile(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_portfolio_sections(id TEXT PRIMARY KEY,content TEXT NOT NULL DEFAULT '',revision INTEGER NOT NULL DEFAULT 1,created TEXT NOT NULL,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_portfolio_files(id TEXT PRIMARY KEY,section_id TEXT NOT NULL,file_name TEXT NOT NULL,file_size INTEGER NOT NULL,description TEXT NOT NULL DEFAULT '',received_size INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL,completed TEXT);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_portfolio_chunks(file_id TEXT NOT NULL REFERENCES teacher_portfolio_files(id) ON DELETE CASCADE,part INTEGER NOT NULL,bytes BLOB NOT NULL,hash TEXT NOT NULL,PRIMARY KEY(file_id,part));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS teacher_portfolio_files_section ON teacher_portfolio_files(section_id,completed);
