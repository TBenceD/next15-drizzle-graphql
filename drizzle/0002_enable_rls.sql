-- Enable Row Level Security on both tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now
-- In production, you should make these more restrictive based on your auth system
CREATE POLICY "Allow all operations on users" ON "users"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on posts" ON "posts"
  FOR ALL USING (true) WITH CHECK (true); 