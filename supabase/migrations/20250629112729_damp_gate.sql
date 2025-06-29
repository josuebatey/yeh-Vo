/*
  # Fix wallet RLS policies and handle duplicate wallets

  1. Clean up duplicate wallets (keep the most recent one per user)
  2. Add unique constraint on user_id
  3. Replace generic RLS policy with specific policies
  4. Update increment_daily_spent function
*/

-- First, drop the existing generic policy
DROP POLICY IF EXISTS "Users can manage own wallet" ON wallets;

-- Clean up duplicate wallets - keep only the most recent wallet per user
DELETE FROM wallets 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM wallets 
  ORDER BY user_id, created_at DESC
);

-- Now add unique constraint to prevent multiple wallets per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wallets_user_id_unique' 
    AND table_name = 'wallets'
  ) THEN
    ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Create specific RLS policies for wallets table
CREATE POLICY "Users can insert own wallet"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallet"
  ON wallets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a function to safely increment daily spent amount
CREATE OR REPLACE FUNCTION increment_daily_spent(user_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_limits (user_id, daily_sent_amount, last_reset_date)
  VALUES (user_id, amount, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    daily_sent_amount = CASE 
      WHEN user_limits.last_reset_date = CURRENT_DATE 
      THEN user_limits.daily_sent_amount + amount
      ELSE amount
    END,
    last_reset_date = CURRENT_DATE,
    updated_at = now();
END;
$$;