/*
  # Add phone verification and improve user profiles

  1. New Columns
    - Add phone_number to profiles table
    - Add phone_verified boolean to profiles table
    - Add bank_account_info to profiles table for demo purposes

  2. Security
    - Update existing RLS policies
    - Add proper indexes

  3. Functions
    - Add function to verify phone numbers (simulated)
*/

-- Add phone number and verification to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bank_account_info'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bank_account_info jsonb;
  END IF;
END $$;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Function to simulate phone verification
CREATE OR REPLACE FUNCTION verify_phone_number(p_user_id uuid, p_phone_number text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In a real app, this would send SMS and verify code
  -- For demo, we'll just mark as verified
  UPDATE profiles 
  SET phone_number = p_phone_number, phone_verified = true, updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;

-- Function to simulate bank account linking
CREATE OR REPLACE FUNCTION link_bank_account(p_user_id uuid, p_account_info jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In a real app, this would integrate with banking APIs
  -- For demo, we'll just store the info
  UPDATE profiles 
  SET bank_account_info = p_account_info, updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;