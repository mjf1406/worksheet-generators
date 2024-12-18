CREATE TABLE `expectations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `expectations_by_class_id_idx` ON `expectations` (`class_id`);--> statement-breakpoint
CREATE INDEX `expectations_by_user_id_idx` ON `expectations` (`user_id`);