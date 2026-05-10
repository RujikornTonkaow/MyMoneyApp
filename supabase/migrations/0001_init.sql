-- ============================================================================
-- MyMoneyApp — Initial Database Schema
-- ============================================================================
-- Run this script in Supabase Dashboard → SQL Editor → New query
-- This creates the `transactions` table with Row-Level Security enabled.
--
-- Idempotent: safe to run multiple times. Uses IF NOT EXISTS / DROP IF EXISTS.
-- ============================================================================


-- ─── 1. Enable required extensions ──────────────────────────────────────────
-- pgcrypto provides gen_random_uuid() for UUID primary keys
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ─── 2. Create transactions table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  category    TEXT         NOT NULL,
  note        TEXT         NOT NULL DEFAULT '',
  date        DATE         NOT NULL,
  type        TEXT         NOT NULL CHECK (type IN ('expense', 'income')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_user_id      ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date    ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type    ON public.transactions(user_id, type);


-- ─── 3. Auto-update `updated_at` on row UPDATE ──────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ─── 4. Enable Row-Level Security ───────────────────────────────────────────
-- RLS makes sure each user can only see / modify their OWN rows.
-- Without this, anyone with the anon key could read everyone's data.
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- ─── 5. RLS Policies ────────────────────────────────────────────────────────
-- Drop old policies first so re-runs don't fail
DROP POLICY IF EXISTS "Users can view own transactions"   ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

-- SELECT: only see your own rows
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: can only create rows where user_id = your own auth uid
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: can only update your own rows (and can't change ownership)
CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: can only delete your own rows
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 6. Grant permissions ───────────────────────────────────────────────────
-- The `authenticated` role is what Supabase uses for any logged-in user.
-- The `anon` role is for unauthenticated users — they get no access.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;


-- ─── 7. Sanity check ────────────────────────────────────────────────────────
-- Verify the policies exist (this will show them in the SQL Editor output)
SELECT
  schemaname,
  tablename,
  policyname,
  cmd       AS operation,
  permissive
FROM pg_policies
WHERE tablename = 'transactions'
ORDER BY policyname;
