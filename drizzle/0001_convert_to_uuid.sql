-- Step 1: Add UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Add new UUID columns
ALTER TABLE "users" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
ALTER TABLE "posts" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();
ALTER TABLE "posts" ADD COLUMN "new_author_id" uuid;

-- Step 3: Populate the new author_id column by looking up the user's new UUID
UPDATE "posts" 
SET "new_author_id" = "users"."new_id" 
FROM "users" 
WHERE "posts"."author_id" = "users"."id";

-- Step 4: Drop the old foreign key constraint
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_users_id_fk";

-- Step 5: Drop old columns and rename new ones for users table
ALTER TABLE "users" DROP COLUMN "id";
ALTER TABLE "users" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "users" ADD PRIMARY KEY ("id");

-- Step 6: Drop old columns and rename new ones for posts table
ALTER TABLE "posts" DROP COLUMN "id";
ALTER TABLE "posts" DROP COLUMN "author_id";
ALTER TABLE "posts" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "posts" RENAME COLUMN "new_author_id" TO "author_id";
ALTER TABLE "posts" ADD PRIMARY KEY ("id");
ALTER TABLE "posts" ALTER COLUMN "author_id" SET NOT NULL;

-- Step 7: Recreate the foreign key constraint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action; 