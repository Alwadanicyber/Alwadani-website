CREATE TABLE IF NOT EXISTS `teacher_records` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`grade` text NOT NULL,
	`class_name` text NOT NULL,
	`teacher_name` text NOT NULL,
	`student_count` integer NOT NULL,
	`task_count` integer NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
