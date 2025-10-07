-- 1️⃣ Update wallets table defaults
ALTER TABLE wallets
    ALTER COLUMN balance SET DEFAULT 100.00,
    ALTER COLUMN currency SET DEFAULT 'NGN',
    ALTER COLUMN created_at SET DEFAULT NOW();

-- 2️⃣ Create bank_accounts table
CREATE TABLE bank_accounts (
   id BIGSERIAL PRIMARY KEY,
   account_number VARCHAR(10) NOT NULL,
   bank_code VARCHAR(5) NOT NULL,
   bank_name VARCHAR(50) NOT NULL,
   account_name VARCHAR(50) NOT NULL,
   wallet_id BIGINT NOT NULL,
   CONSTRAINT fk_bankaccount_wallet FOREIGN KEY (wallet_id)
       REFERENCES wallets (id) ON DELETE CASCADE
);

-- 3️⃣ (Optional but recommended) Add index for faster wallet lookup
CREATE INDEX idx_bank_accounts_wallet_id ON bank_accounts(wallet_id);



CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_reference VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  transaction_status VARCHAR(15) NOT NULL,
  amount NUMERIC(18,8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  wallet_id BIGINT NOT NULL,
  CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

-- Optional index for wallet lookups
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
