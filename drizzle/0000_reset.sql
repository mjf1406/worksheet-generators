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
CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`behavior_id` text,
	`reward_item_id` text,
	`class_id` text NOT NULL,
	`user_id` text NOT NULL,
	`threshold` integer NOT NULL,
	`name` text NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`behavior_id`) REFERENCES `behaviors`(`behavior_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reward_item_id`) REFERENCES `reward_items`(`item_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`data` text,
	`due_date` text,
	`topic` text,
	`working_date` text,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `behaviors` (
	`behavior_id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`point_value` integer NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`title` text,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
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
CREATE TABLE `groups` (
	`group_id` text PRIMARY KEY NOT NULL,
	`group_name` text NOT NULL,
	`class_id` text NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `reward_items` (
	`item_id` text PRIMARY KEY NOT NULL,
	`class_id` text,
	`user_id` text NOT NULL,
	`price` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`type` text NOT NULL,
	`title` text,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`assignment_id` text NOT NULL,
	`complete` integer,
	`excused` integer,
	`completed_ts` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `student_classes` (
	`enrollment_id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`class_id` text NOT NULL,
	`enrollment_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`points` integer,
	`point_history` text,
	`redemption_history` text,
	`absent_dates` text,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	`student_name_first_en` text NOT NULL,
	`student_name_last_en` text NOT NULL,
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
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_id` text NOT NULL,
	`name` text NOT NULL,
	`created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
CREATE INDEX `absent_dates_by_class_id_idx` ON `absent_dates` (`class_id`);--> statement-breakpoint
CREATE INDEX `absent_dates_by_student_id_idx` ON `absent_dates` (`student_id`);--> statement-breakpoint
CREATE INDEX `absent_dates_by_user_id_idx` ON `absent_dates` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_achievements_behavior_id` ON `achievements` (`behavior_id`);--> statement-breakpoint
CREATE INDEX `idx_achievements_class_id` ON `achievements` (`class_id`);--> statement-breakpoint
CREATE INDEX `idx_achievements_user_id` ON `achievements` (`user_id`);--> statement-breakpoint
CREATE INDEX `assigner_by_user_id_idx` ON `assigners` (`user_id`);--> statement-breakpoint
CREATE INDEX `assignments_by_class_id_idx` ON `assignments` (`class_id`);--> statement-breakpoint
CREATE INDEX `assignments_by_user_id_idx` ON `assignments` (`user_id`);--> statement-breakpoint
CREATE INDEX `behaviors_by_class_id_idx` ON `behaviors` (`class_id`);--> statement-breakpoint
CREATE INDEX `behaviors_by_user_id_idx` ON `behaviors` (`user_id`);--> statement-breakpoint
CREATE INDEX `expectations_by_class_id_idx` ON `expectations` (`class_id`);--> statement-breakpoint
CREATE INDEX `expectations_by_user_id_idx` ON `expectations` (`user_id`);--> statement-breakpoint
CREATE INDEX `groups_by_class_id_idx` ON `groups` (`class_id`);--> statement-breakpoint
CREATE INDEX `points_by_class_id_idx` ON `points` (`class_id`);--> statement-breakpoint
CREATE INDEX `points_by_student_id_idx` ON `points` (`student_id`);--> statement-breakpoint
CREATE INDEX `points_by_user_id_idx` ON `points` (`user_id`);--> statement-breakpoint
CREATE INDEX `reward_items_by_class_id_idx` ON `reward_items` (`class_id`);--> statement-breakpoint
CREATE INDEX `reward_items_by_user_id_idx` ON `reward_items` (`user_id`);--> statement-breakpoint
CREATE INDEX `student_assignments_user_id_idx` ON `student_assignments` (`user_id`);--> statement-breakpoint
CREATE INDEX `student_assignments_class_id_idx` ON `student_assignments` (`class_id`);--> statement-breakpoint
CREATE INDEX `student_assignments_student_id_idx` ON `student_assignments` (`student_id`);--> statement-breakpoint
CREATE INDEX `student_assignments_assignment_id_idx` ON `student_assignments` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `students_by_class_id_idx` ON `student_classes` (`class_id`);--> statement-breakpoint
CREATE INDEX `student_expectations_by_class_id_idx` ON `student_expectations` (`class_id`);--> statement-breakpoint
CREATE INDEX `student_expectations_by_user_id_idx` ON `student_expectations` (`user_id`);--> statement-breakpoint
CREATE INDEX `student_expectations_by_student_id_idx` ON `student_expectations` (`student_id`);--> statement-breakpoint
CREATE INDEX `groups_by_student_id_idx` ON `student_groups` (`student_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_student_email_unique` ON `students` (`student_email`);--> statement-breakpoint
CREATE INDEX `classes_by_user_id_idx` ON `teacher_classes` (`user_id`);--> statement-breakpoint
CREATE INDEX `topics_by_class_id_idx` ON `topics` (`class_id`);--> statement-breakpoint
CREATE INDEX `topics_by_user_id_idx` ON `topics` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_email_unique` ON `users` (`user_email`);