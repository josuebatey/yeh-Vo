/*
  # Complete VoicePay Database Schema

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, references auth.users)
      - `email` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `wallets` - Algorand wallet storage
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `algorand_address` (text, unique)
      - `encrypted_mnemonic` (text, encrypted)
      - `balance` (numeric, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions` - All payment transactions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` ('send' | 'receive')
      - `amount` (numeric)
      - `currency` (text, default 'ALGO')
      - `channel` ('algorand' | 'mobile_money' | 'bank')
      - `to_address` (text, nullable)
      - `from_address` (text, nullable)
      - `algorand_tx_id` (text, nullable)
      - `status` ('pending' | 'completed' | 'failed')
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamp)
    
    - `investments` - Investment tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount_invested` (numeric)
      - `apy_rate` (numeric, default 8.5)
      - `start_date` (timestamp)
      - `projected_return` (numeric)
      - `current_value` (numeric)
      - `status` ('active' | 'withdrawn')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_limits` - Daily sending limits and pro status
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `daily_send_limit` (numeric, default 10)
      - `daily_sent_amount` (numeric, default 0)
      - `is_pro` (boolean, default false)
      - `last_reset_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for reading public profile information

  3. Functions
    - Function to increment daily spent amount
    - Triggers for updating timestamps
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  algorand_address text UNIQUE NOT NULL,
  encrypted_mnemonic text NOT NULL,
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wallet" ON wallets
  FOR ALL USING (auth.uid() = user_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('send', 'receive')),
  amount numeric NOT NULL,
  currency text DEFAULT 'ALGO',
  channel text NOT NULL CHECK (channel IN ('algorand', 'mobile_money', 'bank')),
  to_address text,
  from_address text,
  algorand_tx_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount_invested numeric NOT NULL,
  apy_rate numeric DEFAULT 8.5,
  start_date timestamptz DEFAULT now(),
  projected_return numeric DEFAULT 0,
  current_value numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own investments" ON investments
  FOR ALL USING (auth.uid() = user_id);

-- User limits table
CREATE TABLE IF NOT EXISTS user_limits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  daily_send_limit numeric DEFAULT 10,
  daily_sent_amount numeric DEFAULT 0,
  is_pro boolean DEFAULT false,
  last_reset_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own limits" ON user_limits
  FOR ALL USING (auth.uid() = user_id);

-- Function to increment daily spent amount
CREATE OR REPLACE FUNCTION increment_daily_spent(user_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  INSERT INTO user_limits (user_id, daily_sent_amount, last_reset_date)
  VALUES (user_id, amount, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    daily_sent_amount = CASE 
      WHEN user_limits.last_reset_date = CURRENT_DATE THEN user_limits.daily_sent_amount + amount
      ELSE amount
    END,
    last_reset_date = CURRENT_DATE,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_limits_updated_at
  BEFORE UPDATE ON user_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_algorand_address ON wallets(algorand_address);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_algorand_tx_id ON transactions(algorand_tx_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON user_limits(user_id);