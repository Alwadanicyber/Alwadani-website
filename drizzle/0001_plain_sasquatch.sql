CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`definition` text NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `students` ADD `course` text DEFAULT 'life-stories' NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `snapshot` text;