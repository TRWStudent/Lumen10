/*
  # Create user_profiles table

  1. New Tables
    - `user_profiles`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `role` (text, not null) - User role (e.g., 'client', 'admin')
      - `created_at` (timestamptz) - Timestamp of profile creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read their own profile
    - Add policy for admins to read all profiles
    - Add policy for users to update their own profile (except role)
    - Add policy for admins to update any profile

  3. Data
    - Insert profiles for demo users:
      - ilva@foundation.com with role 'client'
      - admin@mairhofer.com with role 'admin'
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
REATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (C
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM user_profiles WHERE user_id = auth.uid()));

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Insert demo user profiles
INSERT INTO user_profiles (user_id, role)
VALUES
  ('b0bd8bab-e4c5-4f3a-99d8-97f5c99636d3', 'client'),
  ('dbbec204-7495-40d8-b657-66a4e20f6506', 'admin')
ON CONFLICT (user_id) DO NOTHING;
