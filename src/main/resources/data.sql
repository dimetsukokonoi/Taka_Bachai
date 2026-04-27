-- =============================================
-- Taka Bachai - Seed Data (H2 Compatible)
-- =============================================

-- ========== USERS (10 Bangladeshi Users) ==========
INSERT INTO users (id, full_name, email, phone, role) VALUES
(1, 'Rahim Uddin', 'rahim.uddin@email.com', '01711234567', 'ADMIN');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(2, 'Fatema Akter', 'fatema.akter@email.com', '01812345678', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(3, 'Kamal Hossain', 'kamal.hossain@email.com', '01913456789', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(4, 'Nusrat Jahan', 'nusrat.jahan@email.com', '01614567890', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(5, 'Arif Rahman', 'arif.rahman@email.com', '01515678901', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(6, 'Tasnia Islam', 'tasnia.islam@email.com', '01916789012', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(7, 'Shahed Alam', 'shahed.alam@email.com', '01717890123', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(8, 'Mithila Sarker', 'mithila.sarker@email.com', '01818901234', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(9, 'Jubayer Ahmed', 'jubayer.ahmed@email.com', '01319012345', 'USER');
INSERT INTO users (id, full_name, email, phone, role) VALUES
(10, 'Rabeya Khatun', 'rabeya.khatun@email.com', '01420123456', 'USER');

-- ========== CATEGORIES ==========
INSERT INTO categories (id, name, type, icon, color) VALUES (1, 'Salary', 'INCOME', '💰', '#4CAF50');
INSERT INTO categories (id, name, type, icon, color) VALUES (2, 'Freelance', 'INCOME', '💻', '#8BC34A');
INSERT INTO categories (id, name, type, icon, color) VALUES (3, 'Business', 'INCOME', '📊', '#009688');
INSERT INTO categories (id, name, type, icon, color) VALUES (4, 'Gift', 'INCOME', '🎁', '#FF9800');
INSERT INTO categories (id, name, type, icon, color) VALUES (5, 'Food & Dining', 'EXPENSE', '🍛', '#F44336');
INSERT INTO categories (id, name, type, icon, color) VALUES (6, 'Transport', 'EXPENSE', '🚌', '#9C27B0');
INSERT INTO categories (id, name, type, icon, color) VALUES (7, 'Shopping', 'EXPENSE', '🛒', '#E91E63');
INSERT INTO categories (id, name, type, icon, color) VALUES (8, 'Rent', 'EXPENSE', '🏠', '#795548');
INSERT INTO categories (id, name, type, icon, color) VALUES (9, 'Utilities', 'EXPENSE', '💡', '#FF5722');
INSERT INTO categories (id, name, type, icon, color) VALUES (10, 'Healthcare', 'EXPENSE', '🏥', '#607D8B');
INSERT INTO categories (id, name, type, icon, color) VALUES (11, 'Education', 'EXPENSE', '📚', '#3F51B5');
INSERT INTO categories (id, name, type, icon, color) VALUES (12, 'Entertainment', 'EXPENSE', '🎬', '#673AB7');
INSERT INTO categories (id, name, type, icon, color) VALUES (13, 'Mobile Recharge', 'EXPENSE', '📱', '#00BCD4');
INSERT INTO categories (id, name, type, icon, color) VALUES (14, 'Groceries', 'EXPENSE', '🥦', '#4CAF50');
INSERT INTO categories (id, name, type, icon, color) VALUES (15, 'Clothing', 'EXPENSE', '👔', '#FF4081');

-- ========== WALLETS ==========
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (1, 1, 'Cash in Hand', 'CASH', 15000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (2, 1, 'bKash Personal', 'BKASH', 8500.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (3, 1, 'Dutch-Bangla Bank', 'BANK', 125000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (4, 2, 'Cash', 'CASH', 5200.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (5, 2, 'Nagad', 'NAGAD', 12000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (6, 2, 'City Bank', 'BANK', 85000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (7, 3, 'Cash', 'CASH', 22000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (8, 3, 'bKash', 'BKASH', 6800.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (9, 3, 'Rocket', 'ROCKET', 3500.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (10, 4, 'Cash', 'CASH', 9500.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (11, 4, 'bKash', 'BKASH', 15000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (12, 5, 'Cash', 'CASH', 35000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (13, 5, 'BRAC Bank', 'BANK', 250000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (14, 5, 'bKash', 'BKASH', 18000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (15, 6, 'Cash', 'CASH', 7500.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (16, 6, 'Nagad', 'NAGAD', 4200.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (17, 7, 'Cash', 'CASH', 12000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (18, 7, 'Islami Bank', 'BANK', 180000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (19, 8, 'Cash', 'CASH', 6000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (20, 8, 'bKash', 'BKASH', 9800.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (21, 9, 'Cash', 'CASH', 28000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (22, 9, 'Eastern Bank', 'BANK', 95000.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (23, 10, 'Cash', 'CASH', 4500.00);
INSERT INTO wallets (id, user_id, wallet_name, wallet_type, balance) VALUES (24, 10, 'bKash', 'BKASH', 11000.00);

-- ========== TRANSACTIONS (Sample) ==========
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (1, 1, 3, 1, 'INCOME', 45000.00, 'March Salary from ABC Ltd.', '2026-03-01 09:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (2, 1, 1, 5, 'EXPENSE', 350.00, 'Lunch at Star Kabab', '2026-03-02 13:30:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (3, 1, 2, 6, 'EXPENSE', 120.00, 'Pathao ride to office', '2026-03-03 08:15:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (4, 1, 1, 14, 'EXPENSE', 2500.00, 'Weekly groceries from Shwapno', '2026-03-04 18:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (5, 1, 3, 8, 'EXPENSE', 12000.00, 'Monthly house rent', '2026-03-05 10:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (6, 1, 2, 13, 'EXPENSE', 299.00, 'Grameenphone recharge', '2026-03-06 11:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (7, 1, 1, 5, 'EXPENSE', 450.00, 'Dinner with friends at Chillox', '2026-03-07 20:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (8, 1, 3, 9, 'EXPENSE', 3500.00, 'Electricity bill DESCO', '2026-03-08 14:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (9, 1, 2, 2, 'INCOME', 8000.00, 'Freelance web project payment', '2026-03-09 16:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (10, 1, 1, 6, 'EXPENSE', 80.00, 'CNG auto to Gulshan', '2026-03-10 09:30:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (11, 2, 6, 1, 'INCOME', 35000.00, 'Salary from XYZ Corp', '2026-03-01 09:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (12, 2, 4, 5, 'EXPENSE', 280.00, 'Biryani from Haji Biriyani', '2026-03-02 13:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (13, 2, 5, 7, 'EXPENSE', 4500.00, 'Shopping at Bashundhara City', '2026-03-03 16:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (14, 2, 6, 8, 'EXPENSE', 10000.00, 'Mess rent payment', '2026-03-05 10:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (15, 2, 4, 10, 'EXPENSE', 1500.00, 'Doctor visit at Popular Hospital', '2026-03-06 11:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (16, 3, 7, 3, 'INCOME', 60000.00, 'Business profit - garments', '2026-03-01 12:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (17, 3, 8, 6, 'EXPENSE', 200.00, 'Uber ride', '2026-03-02 10:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (18, 3, 7, 5, 'EXPENSE', 600.00, 'Family dinner at Khazana', '2026-03-03 19:30:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (19, 3, 9, 13, 'EXPENSE', 500.00, 'Robi internet package', '2026-03-04 15:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (20, 3, 8, 11, 'EXPENSE', 5000.00, 'Childrens school fees', '2026-03-05 09:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (21, 5, 13, 1, 'INCOME', 75000.00, 'Monthly salary - Software Engineer', '2026-03-01 09:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (22, 5, 12, 5, 'EXPENSE', 400.00, 'Kacchi at Sultans Dine', '2026-03-02 14:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (23, 5, 14, 12, 'EXPENSE', 999.00, 'Netflix subscription', '2026-03-03 20:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (24, 5, 13, 9, 'EXPENSE', 2800.00, 'Gas bill - Titas Gas', '2026-03-04 11:00:00');
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, description, transaction_date) VALUES (25, 5, 12, 15, 'EXPENSE', 3500.00, 'Shirt from Aarong', '2026-03-05 17:00:00');

-- ========== BUDGETS (March 2026) ==========
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (1, 1, 5, '2026-03', 8000.00);
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (2, 1, 6, '2026-03', 3000.00);
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (3, 1, 7, '2026-03', 5000.00);
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (4, 2, 5, '2026-03', 6000.00);
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (5, 2, 7, '2026-03', 8000.00);
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (6, 3, 5, '2026-03', 10000.00);
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (7, 5, 12, '2026-03', 2000.00);
INSERT INTO budgets (id, user_id, category_id, budget_month, limit_amount) VALUES (8, 5, 5, '2026-03', 7000.00);

-- ========== RECURRING BILLS ==========
INSERT INTO recurring_bills (id, user_id, wallet_id, category_id, bill_name, amount, frequency, next_due_date) VALUES (1, 1, 3, 8, 'House Rent', 12000.00, 'MONTHLY', '2026-04-05');
INSERT INTO recurring_bills (id, user_id, wallet_id, category_id, bill_name, amount, frequency, next_due_date) VALUES (2, 1, 2, 9, 'DESCO Electricity', 3500.00, 'MONTHLY', '2026-04-08');
INSERT INTO recurring_bills (id, user_id, wallet_id, category_id, bill_name, amount, frequency, next_due_date) VALUES (3, 1, 2, 13, 'GP Recharge', 299.00, 'MONTHLY', '2026-04-06');
INSERT INTO recurring_bills (id, user_id, wallet_id, category_id, bill_name, amount, frequency, next_due_date) VALUES (4, 2, 6, 8, 'Mess Rent', 10000.00, 'MONTHLY', '2026-04-05');
INSERT INTO recurring_bills (id, user_id, wallet_id, category_id, bill_name, amount, frequency, next_due_date) VALUES (5, 3, 7, 11, 'School Fees', 5000.00, 'MONTHLY', '2026-04-05');
INSERT INTO recurring_bills (id, user_id, wallet_id, category_id, bill_name, amount, frequency, next_due_date) VALUES (6, 5, 13, 9, 'Titas Gas Bill', 2800.00, 'MONTHLY', '2026-04-04');
INSERT INTO recurring_bills (id, user_id, wallet_id, category_id, bill_name, amount, frequency, next_due_date) VALUES (7, 5, 14, 12, 'Netflix', 999.00, 'MONTHLY', '2026-04-03');

-- ========== FINANCIAL GOALS ==========
INSERT INTO financial_goals (id, user_id, goal_name, target_amount, current_amount, deadline, status) VALUES (1, 1, 'Emergency Fund', 100000.00, 35000.00, '2026-12-31', 'IN_PROGRESS');
INSERT INTO financial_goals (id, user_id, goal_name, target_amount, current_amount, deadline, status) VALUES (2, 1, 'New Laptop', 80000.00, 20000.00, '2026-09-01', 'IN_PROGRESS');
INSERT INTO financial_goals (id, user_id, goal_name, target_amount, current_amount, deadline, status) VALUES (3, 2, 'Hajj Savings', 500000.00, 120000.00, '2027-06-01', 'IN_PROGRESS');
INSERT INTO financial_goals (id, user_id, goal_name, target_amount, current_amount, deadline, status) VALUES (4, 3, 'Shop Renovation', 200000.00, 85000.00, '2026-08-01', 'IN_PROGRESS');
INSERT INTO financial_goals (id, user_id, goal_name, target_amount, current_amount, deadline, status) VALUES (5, 5, 'Car Down Payment', 300000.00, 150000.00, '2026-12-31', 'IN_PROGRESS');
INSERT INTO financial_goals (id, user_id, goal_name, target_amount, current_amount, deadline, status) VALUES (6, 5, 'Vacation to Coxs Bazar', 25000.00, 25000.00, '2026-04-15', 'COMPLETED');

-- ========== DEBTS & LOANS ==========
INSERT INTO debts_loans (id, user_id, type, person_name, amount, remaining_amount, description, due_date, status) VALUES (1, 1, 'LOAN', 'Rafiq Mia', 15000.00, 15000.00, 'Lent money for medical emergency', '2026-05-01', 'PENDING');
INSERT INTO debts_loans (id, user_id, type, person_name, amount, remaining_amount, description, due_date, status) VALUES (2, 1, 'DEBT', 'Sobuj Bhai', 5000.00, 3000.00, 'Borrowed for bike repair', '2026-04-15', 'PARTIALLY_PAID');
INSERT INTO debts_loans (id, user_id, type, person_name, amount, remaining_amount, description, due_date, status) VALUES (3, 2, 'DEBT', 'Sadia Apa', 8000.00, 8000.00, 'Borrowed for course registration', '2026-06-01', 'PENDING');
INSERT INTO debts_loans (id, user_id, type, person_name, amount, remaining_amount, description, due_date, status) VALUES (4, 3, 'LOAN', 'Nasir Uddin', 25000.00, 10000.00, 'Business loan to friend', '2026-07-01', 'PARTIALLY_PAID');
INSERT INTO debts_loans (id, user_id, type, person_name, amount, remaining_amount, description, due_date, status) VALUES (5, 5, 'DEBT', 'Tanvir Ahmed', 12000.00, 12000.00, 'Borrowed for laptop accessory', '2026-05-15', 'PENDING');
