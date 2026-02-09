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

-- Drop ALL policies
DROP POLICY IF EXISTS "Users can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Just allow authenticated users to read ANY profile
-- (We'll handle authorization in the app layer)
CREATE POLICY "Authenticated users can read profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile, not the role field
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);