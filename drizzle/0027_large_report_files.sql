CREATE TABLE IF NOT EXISTS teacher_report_file_uploads(id TEXT PRIMARY KEY,report_id TEXT NOT NULL REFERENCES teacher_student_reports(id),file_name TEXT NOT NULL,file_type TEXT NOT NULL,file_size INTEGER NOT NULL,received_size INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL,completed TEXT);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_report_file_chunks(upload_id TEXT NOT NULL REFERENCES teacher_report_file_uploads(id),part INTEGER NOT NULL,bytes BLOB NOT NULL,hash TEXT NOT NULL,PRIMARY KEY(upload_id,part));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS teacher_report_current_files(report_id TEXT PRIMARY KEY REFERENCES teacher_student_reports(id),upload_id TEXT NOT NULL REFERENCES teacher_report_file_uploads(id));
