ALTER TABLE `assignments` ADD `created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `assignments` ADD `updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `topics` ADD `created_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `topics` ADD `updated_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL;