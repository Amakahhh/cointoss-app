-- Complete database setup script for Cointoss application
-- Run this script to create and populate the database with test data

-- First, ensure we're connected to the cointoss database
-- psql -U postgres -h localhost -p 5432 -d cointoss

-- Check if tables exist and show their structure
\dt

-- Check what users currently exist
SELECT id, email, first_name, last_name, role, created_at FROM users;

-- Check wallets
SELECT id, user_id, balance, currency, created_at FROM wallets;

-- Check betting pools
SELECT id, asset_pair, status, start_price, end_price, total_up_pool, total_down_pool, open_time, lock_time, settlement_time FROM betting_pools;

-- Check bets
SELECT id, user_id, pool_id, amount, direction, payout, status, created_at FROM bets;

-- Insert test users with BCrypt-encoded passwords
-- Password: "password123" encoded with BCrypt (strength 12)
INSERT INTO users (email, first_name, last_name, password, role, created_at) VALUES
('test@example.com', 'Test', 'User', '$2a$12$YQiY.WUQJQnULlQYTZcYueOjGnFZf.gYz3B.vEHQzYQs9GrQVSKkK', 'USER', NOW()),
('admin@example.com', 'Admin', 'User', '$2a$12$YQiY.WUQJQnULlQYTZcYueOjGnFZf.gYz3B.vEHQzYQs9GrQVSKkK', 'ADMIN', NOW()),
('john@example.com', 'John', 'Doe', '$2a$12$YQiY.WUQJQnULlQYTZcYueOjGnFZf.gYz3B.vEHQzYQs9GrQVSKkK', 'USER', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create wallets for the users (automatically created with default balance)
INSERT INTO wallets (user_id, balance, currency, created_at) VALUES
(1, 1000.00, 'NGN', NOW()),
(2, 5000.00, 'NGN', NOW()),
(3, 500.00, 'NGN', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Create some test betting pools
INSERT INTO betting_pools (asset_pair, status, start_price, end_price, total_up_pool, total_down_pool, open_time, lock_time, settlement_time) VALUES
('BTC/USDT', 'OPEN', 45000.00, NULL, 0.00, 0.00, NOW(), NOW() + INTERVAL '5 minutes', NOW() + INTERVAL '10 minutes'),
('ETH/USDT', 'LOCKED', 3000.00, NULL, 150.00, 200.00, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '5 minutes'),
('BTC/USDT', 'SETTLED', 44000.00, 44500.00, 100.00, 50.00, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '10 minutes');

-- Create some test bets
INSERT INTO bets (user_id, pool_id, amount, direction, payout, status, created_at) VALUES
(1, 2, 100.00, 'UP', NULL, 'PENDING', NOW() - INTERVAL '8 minutes'),
(3, 2, 50.00, 'DOWN', NULL, 'PENDING', NOW() - INTERVAL '7 minutes'),
(1, 3, 75.00, 'UP', 112.50, 'WON', NOW() - INTERVAL '12 minutes'),
(3, 3, 25.00, 'DOWN', 0.00, 'LOST', NOW() - INTERVAL '11 minutes');

-- Verify the data was inserted correctly
SELECT 'Users:' as table_name;
SELECT id, email, first_name, last_name, role, created_at FROM users;

SELECT 'Wallets:' as table_name;
SELECT id, user_id, balance, currency, created_at FROM wallets;

SELECT 'Betting Pools:' as table_name;
SELECT id, asset_pair, status, start_price, end_price, total_up_pool, total_down_pool FROM betting_pools;

SELECT 'Bets:' as table_name;  
SELECT id, user_id, pool_id, amount, direction, payout, status FROM bets;

-- Show some useful queries for testing
SELECT 'Test Login Credentials:' as info;
SELECT 'Email: test@example.com, Password: password123' as credentials
UNION ALL
SELECT 'Email: admin@example.com, Password: password123'
UNION ALL  
SELECT 'Email: john@example.com, Password: password123';