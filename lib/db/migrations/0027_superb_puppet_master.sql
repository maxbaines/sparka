CREATE TABLE IF NOT EXISTS "Prompt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"variables" json DEFAULT 'null'::json,
	"tags" json DEFAULT 'null'::json,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "systemPromptId" uuid;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "systemPromptSnapshot" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_systemPromptId_Prompt_id_fk" FOREIGN KEY ("systemPromptId") REFERENCES "public"."Prompt"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
