CREATE TABLE `student_expectations` (
	`id` text PRIMARY KEY NOT NULL,
	`expectation_id` text NOT NULL,
	`student_id` text NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`value` text,
	`number` integer,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`expectation_id`) REFERENCES `expectations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `student_expectations_by_class_id_idx` ON `student_expectations` (`class_id`);--> statement-breakpoint
CREATE INDEX `student_expectations_by_user_id_idx` ON `student_expectations` (`user_id`);--> statement-breakpoint
CREATE INDEX `student_expectations_by_student_id_idx` ON `student_expectations` (`student_id`);