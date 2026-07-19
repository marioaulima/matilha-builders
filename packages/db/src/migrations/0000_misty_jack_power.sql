CREATE TYPE "public"."product_status" AS ENUM('validating', 'building', 'launched');--> statement-breakpoint
CREATE TABLE "product" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"founder_id" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image_url" text,
	"link" text,
	"name" text NOT NULL,
	"status" "product_status" DEFAULT 'validating' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_founder_id_user_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
);--> statement-breakpoint
-- Backfill one product row per existing founder_profile that had a product, before dropping those columns.
INSERT INTO "product" ("id", "founder_id", "name", "link", "image_url", "status", "created_at", "updated_at")
SELECT gen_random_uuid()::text, "user_id", "product", "link", "product_image_url", "status"::text::"product_status", "created_at", "updated_at"
FROM "founder_profile"
WHERE "product" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "check_in" ADD COLUMN "product_id" text;--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_profile" DROP COLUMN "product";--> statement-breakpoint
ALTER TABLE "founder_profile" DROP COLUMN "link";--> statement-breakpoint
ALTER TABLE "founder_profile" DROP COLUMN "product_image_url";--> statement-breakpoint
ALTER TABLE "founder_profile" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "founder_profile" RENAME TO "founder";--> statement-breakpoint
DROP TYPE "public"."founder_status";
