CREATE TABLE IF NOT EXISTS course_ranking_settings(course TEXT PRIMARY KEY,mode TEXT NOT NULL CHECK(mode IN ('accuracy','speed')),updated TEXT NOT NULL);
