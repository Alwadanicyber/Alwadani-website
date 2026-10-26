CREATE TABLE IF NOT EXISTS teacher_report_upload_events(id TEXT PRIMARY KEY,report_id TEXT NOT NULL REFERENCES teacher_student_reports(id),file_name TEXT NOT NULL,file_size INTEGER NOT NULL,uploaded TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS teacher_report_uploads_report ON teacher_report_upload_events(report_id);
