CREATE TABLE `assigners` (
	`assigner_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_id` text NOT NULL,
	`assigner_type` text,
	`groups` text,
	`items` text,
	`student_item_status` text,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`class_id` text PRIMARY KEY NOT NULL,
	`class_name` text NOT NULL,
	`class_language` text NOT NULL,
	`class_grade` text,
	`class_year` text,
	`complete` text,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`group_id` text PRIMARY KEY NOT NULL,
	`group_name` text NOT NULL,
	`class_id` text NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_classes` (
	`enrollment_id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`class_id` text NOT NULL,
	`enrollment_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_groups` (
	`enrollment_id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`student_id` text NOT NULL,
	`enrollment_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`student_id` text PRIMARY KEY NOT NULL,
	`student_name_en` text NOT NULL,
	`student_name_alt` text,
	`student_reading_level` text,
	`student_grade` text,
	`student_sex` text,
	`student_number` integer,
	`student_email` text,
	`joined_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teacher_classes` (
	`assignment_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`role` text,
	`assigned_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`user_name` text NOT NULL,
	`user_email` text NOT NULL,
	`user_role` text,
	`joined_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `assigner_by_user_id_idx` ON `assigners` (`user_id`);--> statement-breakpoint
CREATE INDEX `groups_by_class_id_idx` ON `groups` (`class_id`);--> statement-breakpoint
CREATE INDEX `students_by_class_id_idx` ON `student_classes` (`class_id`);--> statement-breakpoint
CREATE INDEX `groups_by_student_id_idx` ON `student_groups` (`student_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_student_email_unique` ON `students` (`student_email`);--> statement-breakpoint
CREATE INDEX `classes_by_user_id_idx` ON `teacher_classes` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_email_unique` ON `users` (`user_email`);