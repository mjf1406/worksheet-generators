ALTER TABLE `classes` ADD `class_code` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `classes_class_code_unique` ON `classes` (`class_code`);