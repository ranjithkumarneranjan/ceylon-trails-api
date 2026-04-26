-- Run this in the Supabase SQL Editor to enable RLS on tasting_notes

ALTER TABLE tasting_notes ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notes
CREATE POLICY "Users can view own notes"
  ON tasting_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert notes for themselves
CREATE POLICY "Users can insert own notes"
  ON tasting_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notes
CREATE POLICY "Users can update own notes"
  ON tasting_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own notes
CREATE POLICY "Users can delete own notes"
  ON tasting_notes FOR DELETE
  USING (auth.uid() = user_id);
