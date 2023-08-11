CREATE TABLE `invite_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`active` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`user_id` integer NOT NULL,
	`session_id` text NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emailIdx` ON `users` (`email`);