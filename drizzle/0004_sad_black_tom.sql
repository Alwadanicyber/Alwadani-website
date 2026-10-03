CREATE TABLE `teacher_account` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teacher_attempts` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teacher_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`teacher` integer NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`teacher`) REFERENCES `teacher_account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_teacher_sessions_expires` ON `teacher_sessions` (`expires`);