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
/*
 SQLite does not support "Set not null to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `behaviors` ADD `title` text;--> statement-breakpoint
CREATE INDEX `idx_achievements_behavior_id` ON `achievements` (`behavior_id`);--> statement-breakpoint
CREATE INDEX `idx_achievements_class_id` ON `achievements` (`class_id`);--> statement-breakpoint
CREATE INDEX `idx_achievements_user_id` ON `achievements` (`user_id`);