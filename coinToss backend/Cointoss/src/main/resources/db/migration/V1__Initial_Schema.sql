-- This file contains SQL commands to create the initial database schema for the Cointoss application.

-- Use SERIAL for auto-incrementing primary keys in PostgreSQL
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       first_name VARCHAR(255) NOT NULL, -- Removed UNIQUE constraint here as it's likely not intended for first name
                       last_name VARCHAR(255) NOT NULL,  -- Removed UNIQUE constraint here as it's likely not intended for last name
                       password VARCHAR(255) NOT NULL,
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP -- Use TIMESTAMPTZ for timezone-aware timestamps
);


CREATE TABLE betting_pools (
                               id BIGSERIAL PRIMARY KEY,
                               asset_pair VARCHAR(50) NOT NULL,
    -- Use CHECK constraints for ENUM-like behavior in PostgreSQL
                               status VARCHAR(10) NOT NULL CHECK (status IN ('OPEN', 'LOCKED', 'SETTLED')),
                               start_price DECIMAL(10, 2) NOT NULL,
                               end_price DECIMAL(10, 2),
                               total_up_pool DECIMAL(10, 2) DEFAULT 0,
                               total_down_pool DECIMAL(10, 2) DEFAULT 0,
                               open_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                               lock_time TIMESTAMPTZ,
                               settlement_time TIMESTAMPTZ
);




CREATE TABLE bets (
                      id BIGSERIAL PRIMARY KEY,
                      user_id BIGINT NOT NULL,
                      pool_id BIGINT NOT NULL,
                      amount DECIMAL(10, 2) NOT NULL,
                      direction VARCHAR(4) NOT NULL CHECK (direction IN ('UP', 'DOWN')), -- Use VARCHAR with CHECK constraint
                      payout DECIMAL(10, 2),
                      status VARCHAR(10) NOT NULL CHECK (status IN ('PENDING', 'WON', 'LOST')), -- Use VARCHAR with CHECK constraint
                      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Added ON DELETE CASCADE for user removal
                      FOREIGN KEY (pool_id) REFERENCES betting_pools(id) ON DELETE CASCADE -- Added ON DELETE CASCADE for pool removal
);



CREATE TABLE wallets (
                         id BIGSERIAL PRIMARY KEY,
                         user_id BIGINT NOT NULL UNIQUE,
                         balance DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
                         currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMPTZ, -- NULL is default in PostgreSQL if not specified otherwise
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Added ON DELETE CASCADE for user removal
);
