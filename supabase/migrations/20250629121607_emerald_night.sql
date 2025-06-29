/*
  # Fix ambiguous user_id reference in increment_daily_spent function

  1. Changes
    - Drop the existing increment_daily_spent function
    - Recreate it with renamed parameter to avoid ambiguity
    - Use p_user_id parameter name instead of user_id to prevent conflicts
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS increment_daily_spent(uuid, numeric);

-- Recreate the function with proper parameter naming
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