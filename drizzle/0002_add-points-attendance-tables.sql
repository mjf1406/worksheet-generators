CREATE TABLE `absent_dates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`date` text NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `points` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`behavior_id` text,
	`reward_item_id` text,
	`type` text NOT NULL,
	`number_of_points` integer NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`behavior_id`) REFERENCES `behaviors`(`behavior_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reward_item_id`) REFERENCES `reward_items`(`item_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `absent_dates_by_class_id_idx` ON `absent_dates` (`class_id`);--> statement-breakpoint
CREATE INDEX `absent_dates_by_student_id_idx` ON `absent_dates` (`student_id`);--> statement-breakpoint
CREATE INDEX `absent_dates_by_user_id_idx` ON `absent_dates` (`user_id`);--> statement-breakpoint
CREATE INDEX `points_by_class_id_idx` ON `points` (`class_id`);--> statement-breakpoint
CREATE INDEX `points_by_student_id_idx` ON `points` (`student_id`);--> statement-breakpoint
CREATE INDEX `points_by_user_id_idx` ON `points` (`user_id`);