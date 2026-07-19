ALTER TABLE "check_in" DROP CONSTRAINT "check_in_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;