/*
  # Create documents table

  1. New Tables
    - `documents`
      - `id` (uuid, primary key) - Unique identifier for each document
      - `user_id` (uuid, foreign key) - References the user who owns the document
      - `document_type` (text) - Type/category of the document
      - `file_path` (text) - Storage path or URL to the document file
      - `status` (text) - Current status of the document (e.g., pending, approved, rejected)
      - `note` (text, optional) - Additional notes or comments about the document
      - `created_at` (timestamptz) - Timestamp when the document was created

  2. Security
    - Enable RLS on `documents` table
    - Add policy for users to view their own documents
    - Add policy for users to insert their own documents
    - Add policy for users to update their own documents
    - Add policy for users to delete their own documents

  3. Important Notes
    - All documents are private to the user who created them
    - Users can only access documents where user_id matches their auth.uid()
    - The user_id field is automatically set to the authenticated user's ID
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);