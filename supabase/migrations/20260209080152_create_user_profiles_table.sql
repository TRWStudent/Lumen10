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

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Create a security definer function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Policy: Users can read their own profile OR if they're admin
CREATE POLICY "Users can read profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Policy: Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND role = (
      SELECT role FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
-- 1. Check what policies exist now
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'user_profiles';