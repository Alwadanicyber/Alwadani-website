CREATE TABLE IF NOT EXISTS student_sessions (
 student text PRIMARY KEY NOT NULL REFERENCES students(id),
 attempt integer DEFAULT 1 NOT NULL,
 started text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS student_attempts (
 student text NOT NULL REFERENCES students(id),
 attempt integer NOT NULL,
 course text NOT NULL,
 snapshot text NOT NULL,
 answers text NOT NULL,
 reads text NOT NULL,
 score integer NOT NULL,
 total integer NOT NULL,
 answered integer NOT NULL,
 completed text,
 created text NOT NULL,
 PRIMARY KEY(student,attempt)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_student_attempts_course ON student_attempts(course);
