ALTER TABLE "user" ADD COLUMN "username_updated_at" timestamp with time zone DEFAULT now() NOT NULL;