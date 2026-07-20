CREATE TABLE "check_in_dismissal_vote" (
	"check_in_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"voter_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "check_in" ADD COLUMN "dismissed_at" timestamp;--> statement-breakpoint
ALTER TABLE "check_in_dismissal_vote" ADD CONSTRAINT "check_in_dismissal_vote_check_in_id_check_in_id_fk" FOREIGN KEY ("check_in_id") REFERENCES "public"."check_in"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_dismissal_vote" ADD CONSTRAINT "check_in_dismissal_vote_voter_id_user_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "check_in_dismissal_vote_unique" ON "check_in_dismissal_vote" USING btree ("check_in_id","voter_id");