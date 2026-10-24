CREATE TABLE IF NOT EXISTS national_initiative_highlights(post_id TEXT PRIMARY KEY REFERENCES national_initiative_posts(id),enabled INTEGER NOT NULL DEFAULT 1);
