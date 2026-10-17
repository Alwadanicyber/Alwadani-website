CREATE TABLE IF NOT EXISTS assistant_settings(id INTEGER PRIMARY KEY CHECK(id=1),enabled INTEGER NOT NULL,daily_limit INTEGER NOT NULL,visitor_limit INTEGER NOT NULL,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS assistant_usage(bucket TEXT NOT NULL,window INTEGER NOT NULL,count INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL,PRIMARY KEY(bucket,window));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS assistant_calls(request TEXT PRIMARY KEY,bucket TEXT NOT NULL,created INTEGER NOT NULL);
