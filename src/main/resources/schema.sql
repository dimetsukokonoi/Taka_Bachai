-- =============================================
-- Taka Bachai - Database Schema
-- Personal Money Management System
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table (multi-wallet support)
CREATE TABLE IF NOT EXISTS wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_name VARCHAR(50) NOT NULL,
    wallet_type VARCHAR(30) NOT NULL, -- CASH, BKASH, NAGAD, BANK, ROCKET, CREDIT_CARD
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(5) DEFAULT 'BDT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL, -- INCOME or EXPENSE
    icon VARCHAR(50),
    color VARCHAR(10)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id BIGINT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    type VARCHAR(10) NOT NULL, -- INCOME or EXPENSE
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    transaction_date TIMESTAMP NOT NULL,
    receipt_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table (monthly budget limits)
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    budget_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    limit_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, budget_month)
);

-- Recurring Bills table
CREATE TABLE IF NOT EXISTS recurring_bills (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id BIGINT REFERENCES wallets(id),
    category_id BIGINT REFERENCES categories(id),
    bill_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Goals table
CREATE TABLE IF NOT EXISTS financial_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts and Loans table
CREATE TABLE IF NOT EXISTS debts_loans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL, -- DEBT or LOAN
    person_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PARTIALLY_PAID, PAID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
-- =============================================
-- Taka Bachai - Database Schema
-- Personal Money Management System
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table (multi-wallet support)
CREATE TABLE IF NOT EXISTS wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_name VARCHAR(50) NOT NULL,
    wallet_type VARCHAR(30) NOT NULL, -- CASH, BKASH, NAGAD, BANK, ROCKET, CREDIT_CARD
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(5) DEFAULT 'BDT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL, -- INCOME or EXPENSE
    icon VARCHAR(50),
    color VARCHAR(10)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id BIGINT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    type VARCHAR(10) NOT NULL, -- INCOME or EXPENSE
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    transaction_date TIMESTAMP NOT NULL,
    receipt_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table (monthly budget limits)
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    budget_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    limit_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, budget_month)
);

-- Recurring Bills table
CREATE TABLE IF NOT EXISTS recurring_bills (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id BIGINT REFERENCES wallets(id),
    category_id BIGINT REFERENCES categories(id),
    bill_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Goals table
CREATE TABLE IF NOT EXISTS financial_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts and Loans table
CREATE TABLE IF NOT EXISTS debts_loans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL, -- DEBT or LOAN
    person_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PARTIALLY_PAID, PAID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, budget_month);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_user ON recurring_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_loans_user ON debts_loans(user_id);

-- =========================================================================
-- COMPLEX SQL QUERIES (COURSE REQUIREMENTS)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. OUTER JOIN & SUBQUERIES
-- Feature: Advanced Admin Financial Summary
-- -------------------------------------------------------------------------
-- Description:
-- Calculates the total combined wallet balance and total outstanding debt 
-- for every user on the platform. It uses LEFT OUTER JOINs against nested 
-- aggregate subqueries to ensure that users with no wallets or no debts 
-- still appear in the result set, and to prevent Cartesian Products 
-- (which would multiply balances if joined directly).

CREATE OR REPLACE VIEW vw_user_financial_summary AS
SELECT 
    u.id, 
    u.full_name, 
    u.email, 
    u.role, 
    COALESCE(w_agg.total_balance, 0) AS total_balance, 
    COALESCE(d_agg.total_debt, 0) AS total_debt
FROM users u
LEFT OUTER JOIN (
    SELECT user_id, SUM(balance) AS total_balance 
    FROM wallets 
    GROUP BY user_id
) w_agg ON u.id = w_agg.user_id
LEFT OUTER JOIN (
    SELECT user_id, SUM(amount) AS total_debt 
    FROM debts_loans 
    GROUP BY user_id
) d_agg ON u.id = d_agg.user_id;

-- -------------------------------------------------------------------------
-- 2. INNER JOIN & NESTED SUBQUERIES (HAVING clause)
-- Feature: Spending Insights vs Platform Average
-- -------------------------------------------------------------------------
-- Description:
-- Identifies behavioral spending warnings for a specific user. It joins 
-- the transactions table with the categories table using an INNER JOIN. 
-- It then uses deeply nested subqueries in both the SELECT clause 
-- (to fetch the platform-wide average for that category) and the HAVING 
-- clause (to filter the results to ONLY show categories where the user 
-- has spent more than the platform average).

CREATE OR REPLACE VIEW vw_spending_insights AS
SELECT 
    t.user_id,
    c.name AS category_name, 
    SUM(t.amount) AS user_spending,
    ca.average_spending
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
INNER JOIN (
    SELECT category_id, AVG(total_spent) AS average_spending
    FROM (
        SELECT user_id, category_id, SUM(amount) AS total_spent 
        FROM transactions 
        WHERE type = 'EXPENSE' 
        GROUP BY user_id, category_id
    ) AS user_totals
    GROUP BY category_id
) ca ON c.id = ca.category_id
WHERE t.type = 'EXPENSE'
GROUP BY t.user_id, c.id, c.name, ca.average_spending
HAVING SUM(t.amount) > ca.average_spending;
