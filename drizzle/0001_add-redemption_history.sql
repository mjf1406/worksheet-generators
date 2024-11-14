CREATE TABLE `behaviors` (
	`behavior_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`point_value` integer NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`class_id` text,
	`user_id` text NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reward_items` (
	`item_id` text PRIMARY KEY NOT NULL,
	`price` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`class_id` text,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `student_classes` ADD `points` integer;--> statement-breakpoint
ALTER TABLE `student_classes` ADD `point_history` text;--> statement-breakpoint
ALTER TABLE `student_classes` ADD `redemption_history` text;--> statement-breakpoint
ALTER TABLE `student_classes` ADD `absent_dates` text;--> statement-breakpoint
CREATE INDEX `behaviors_by_class_id_idx` ON `behaviors` (`class_id`);--> statement-breakpoint
CREATE INDEX `behaviors_by_user_id_idx` ON `behaviors` (`user_id`);--> statement-breakpoint
CREATE INDEX `reward_items_by_class_id_idx` ON `reward_items` (`class_id`);--> statement-breakpoint
CREATE INDEX `reward_items_by_user_id_idx` ON `reward_items` (`user_id`);