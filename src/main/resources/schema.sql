-- =============================================
-- Taka Bachai - Database Schema
-- Personal Money Management System
-- =============================================

-- Drop legacy views first so CREATE OR REPLACE always works on a clean state
DROP VIEW IF EXISTS vw_user_financial_summary;
DROP VIEW IF EXISTS vw_spending_insights;

-- ---------------- USERS ----------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20) DEFAULT 'USER',
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- WALLETS ----------------
CREATE TABLE IF NOT EXISTS wallets (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_name VARCHAR(50)  NOT NULL,
    -- CASH, BKASH, NAGAD, BANK, ROCKET, CREDIT_CARD
    wallet_type VARCHAR(30)  NOT NULL,
    balance     DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency    VARCHAR(5)   NOT NULL DEFAULT 'BDT',
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- CATEGORIES ----------------
CREATE TABLE IF NOT EXISTS categories (
    id    BIGSERIAL PRIMARY KEY,
    name  VARCHAR(50) NOT NULL,
    -- INCOME or EXPENSE
    type  VARCHAR(10) NOT NULL,
    icon  VARCHAR(50),
    color VARCHAR(10)
);

-- ---------------- TRANSACTIONS ----------------
CREATE TABLE IF NOT EXISTS transactions (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    wallet_id        BIGINT NOT NULL REFERENCES wallets(id)  ON DELETE CASCADE,
    category_id      BIGINT          REFERENCES categories(id) ON DELETE SET NULL,
    type             VARCHAR(10)  NOT NULL,
    amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description      VARCHAR(255),
    transaction_date TIMESTAMP    NOT NULL,
    receipt_path     VARCHAR(500),
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- BUDGETS ----------------
CREATE TABLE IF NOT EXISTS budgets (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    category_id  BIGINT          REFERENCES categories(id) ON DELETE CASCADE,
    -- YYYY-MM
    budget_month VARCHAR(7)    NOT NULL,
    limit_amount DECIMAL(15,2) NOT NULL CHECK (limit_amount > 0),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, category_id, budget_month)
);

-- ---------------- RECURRING BILLS ----------------
CREATE TABLE IF NOT EXISTS recurring_bills (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    wallet_id     BIGINT          REFERENCES wallets(id)    ON DELETE SET NULL,
    category_id   BIGINT          REFERENCES categories(id) ON DELETE SET NULL,
    bill_name     VARCHAR(100)  NOT NULL,
    amount        DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    -- DAILY, WEEKLY, MONTHLY, YEARLY
    frequency     VARCHAR(20)   NOT NULL,
    next_due_date DATE          NOT NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- FINANCIAL GOALS ----------------
CREATE TABLE IF NOT EXISTS financial_goals (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name      VARCHAR(100)  NOT NULL,
    target_amount  DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    deadline       DATE,
    -- IN_PROGRESS, COMPLETED, CANCELLED
    status         VARCHAR(20)   NOT NULL DEFAULT 'IN_PROGRESS',
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- DEBTS / LOANS ----------------
CREATE TABLE IF NOT EXISTS debts_loans (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- DEBT (I owe) or LOAN (owed to me)
    type             VARCHAR(10)   NOT NULL,
    person_name      VARCHAR(100)  NOT NULL,
    amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    remaining_amount DECIMAL(15,2) NOT NULL CHECK (remaining_amount >= 0),
    description      VARCHAR(255),
    due_date         DATE,
    -- PENDING, PARTIALLY_PAID, PAID
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- INDEXES ----------------
CREATE INDEX IF NOT EXISTS idx_transactions_user      ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date      ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type      ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user           ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month     ON budgets(user_id, budget_month);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_user   ON recurring_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user   ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_loans_user       ON debts_loans(user_id);

-- =========================================================================
-- COMPLEX SQL QUERIES (COURSE REQUIREMENTS)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. OUTER JOIN & SUBQUERIES
-- Feature: Advanced Admin Financial Summary
-- -------------------------------------------------------------------------
-- For every user, calculates the total wallet balance and total *outstanding*
-- DEBT (only `type = 'DEBT'` and only the not-yet-repaid `remaining_amount`).
-- Uses LEFT OUTER JOINs against nested aggregate subqueries so users with no
-- wallets/debts still appear and to avoid Cartesian products when a user has
-- multiple wallets and debts simultaneously.
CREATE OR REPLACE VIEW vw_user_financial_summary AS
SELECT
    u.id,
    u.full_name,
    u.email,
    u.role,
    COALESCE(w_agg.total_balance, 0) AS total_balance,
    COALESCE(d_agg.total_debt,    0) AS total_debt
FROM users u
LEFT OUTER JOIN (
    SELECT user_id, SUM(balance) AS total_balance
    FROM wallets
    GROUP BY user_id
) w_agg ON u.id = w_agg.user_id
LEFT OUTER JOIN (
    SELECT user_id, SUM(remaining_amount) AS total_debt
    FROM debts_loans
    WHERE type = 'DEBT' AND status <> 'PAID'
    GROUP BY user_id
) d_agg ON u.id = d_agg.user_id;

-- -------------------------------------------------------------------------
-- 2. INNER JOIN & NESTED SUBQUERIES (HAVING clause)
-- Feature: Spending Insights vs Platform Average
-- -------------------------------------------------------------------------
-- For each user, returns categories where they spent more than the platform
-- average for that category. INNER JOINs `transactions` with `categories`,
-- then nests subqueries in SELECT and HAVING to compute the dynamic platform
-- average on the fly.
CREATE OR REPLACE VIEW vw_spending_insights AS
SELECT
    t.user_id,
    c.name              AS category_name,
    SUM(t.amount)       AS user_spending,
    ca.average_spending AS average_spending
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
