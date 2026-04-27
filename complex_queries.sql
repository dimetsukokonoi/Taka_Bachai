-- =========================================================================
-- TAKA BACHAI - COMPLEX SQL QUERIES (COURSE REQUIREMENTS)
-- =========================================================================
-- This file contains the explicit complex SQL queries utilized by the backend 
-- Spring Data JPA Repositories to power advanced analytics in the application.

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

SELECT 
    t.user_id,
    c.name AS category_name, 
    SUM(t.amount) AS user_spending,
    (SELECT AVG(total_spent) FROM (
        SELECT user_id, SUM(amount) AS total_spent 
        FROM transactions 
        WHERE category_id = c.id AND type = 'EXPENSE' 
        GROUP BY user_id
    ) AS user_avgs) AS average_spending
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'EXPENSE' -- AND t.user_id = ? (in application)
GROUP BY t.user_id, c.id, c.name
HAVING SUM(t.amount) > (
    SELECT AVG(total_spent) FROM (
        SELECT user_id, SUM(amount) AS total_spent 
        FROM transactions 
        WHERE category_id = c.id AND type = 'EXPENSE' 
        GROUP BY user_id
    ) AS user_avgs2
);
