/*
  # Fix ambiguous user_id reference in increment_daily_spent function

  1. Changes
    - Update increment_daily_spent function to properly qualify user_id column references
    - Rename function parameter to p_user_id to avoid ambiguity
    - Explicitly reference table columns with table name prefix

  2. Security
    - Maintain SECURITY DEFINER to allow function execution
*/

-- Drop and recreate the function with proper column qualification
CREATE OR REPLACE FUNCTION increment_daily_spent(p_user_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_limits (user_id, daily_sent_amount, last_reset_date)
  VALUES (p_user_id, amount, CURRENT_DATE)
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