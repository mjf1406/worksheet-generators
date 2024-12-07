CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`data` text,
	`due_date` text,
	`topic` text,
	`working_data` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assignments_by_class_id_idx` ON `assignments` (`class_id`);--> statement-breakpoint
CREATE INDEX `assignments_by_user_id_idx` ON `assignments` (`user_id`);--> statement-breakpoint
CREATE INDEX `topics_by_class_id_idx` ON `topics` (`class_id`);--> statement-breakpoint
CREATE INDEX `topics_by_user_id_idx` ON `topics` (`user_id`);