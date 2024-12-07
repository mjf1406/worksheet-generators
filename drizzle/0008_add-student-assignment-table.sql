CREATE TABLE `student_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`assignment_id` text NOT NULL,
	`complete` integer,
	`completed_ts` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `student_assignments_user_id_idx` ON `student_assignments` (`user_id`);--> statement-breakpoint
CREATE INDEX `student_assignments_class_id_idx` ON `student_assignments` (`class_id`);--> statement-breakpoint
CREATE INDEX `student_assignments_student_id_idx` ON `student_assignments` (`student_id`);--> statement-breakpoint
CREATE INDEX `student_assignments_assignment_id_idx` ON `student_assignments` (`assignment_id`);