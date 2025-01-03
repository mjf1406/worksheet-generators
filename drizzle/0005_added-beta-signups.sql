CREATE TABLE `beta_signups` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emailUniqueIndex` ON `beta_signups` (`lower("beta_signups"."email")`);