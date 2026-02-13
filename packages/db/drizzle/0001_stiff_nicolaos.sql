CREATE TABLE "super_admin" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "super_admin_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "super_admin" ADD CONSTRAINT "super_admin_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;