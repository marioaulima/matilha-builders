CREATE TYPE "public"."product_interest" AS ENUM('running', 'building', 'observing');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "approval_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'founder' NOT NULL;--> statement-breakpoint
ALTER TABLE "founder" ADD COLUMN "interest" "product_interest";--> statement-breakpoint
ALTER TABLE "founder" ADD COLUMN "phone" text;