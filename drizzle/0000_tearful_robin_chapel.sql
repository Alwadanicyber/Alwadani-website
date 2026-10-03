CREATE TABLE `answers` (
	`student` text NOT NULL,
	`question` integer NOT NULL,
	`choice` integer NOT NULL,
	`correct` integer NOT NULL,
	PRIMARY KEY(`student`, `question`),
	FOREIGN KEY (`student`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reads` (
	`student` text NOT NULL,
	`lesson` integer NOT NULL,
	PRIMARY KEY(`student`, `lesson`),
	FOREIGN KEY (`student`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created` text NOT NULL,
	`completed` text
);
