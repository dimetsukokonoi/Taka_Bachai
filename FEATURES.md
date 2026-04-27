# Taka Bachai - Detailed Feature Documentation

Welcome to the comprehensive feature guide for the **Taka Bachai** Personal Money Management System. This document is designed to help team members quickly understand the full scope of the project's capabilities, making it easier to answer technical and functional questions during university presentations.

---

## 1. Multi-User System & Role-Based Access Control
Taka Bachai supports multiple user profiles in a single system.
* **User Switching:** Users can seamlessly switch between profiles using the dropdown on the homepage (simulated login environment). Data is strictly isolated per user; User A cannot see User B's transactions or wallets.
* **Role Management (Admin vs. User):** The system features a built-in authorization layer based on user roles (`ADMIN` and `USER`).
* **Admin Dashboard:** Users with the `ADMIN` role are granted access to an exclusive "Admin Panel" in the sidebar. This panel allows the administrator to view all registered users in the database, create new users, assign roles, and delete accounts.

## 2. Multi-Wallet Support
Users are not restricted to a single monolithic balance. They can distribute their money across various accounts.
* **Wallet Types:** Supports Cash, Mobile Banking (bKash, Nagad, Rocket), Bank Accounts, and Credit Cards.
* **Net Worth Calculation:** The dashboard intelligently aggregates the balances across all wallets to calculate the user's total Net Worth.
* **Dynamic Updates:** Whenever a transaction is logged, the associated wallet's balance is automatically updated.

## 3. Comprehensive Transaction Logging
The core functionality of the platform revolves around tracking cash flow.
* **Income & Expense Tracking:** Users can log both incoming money and outgoing expenses.
* **Categorization:** Every transaction is tied to a specific category (e.g., Food, Rent, Salary, Freelance) represented by visual emojis and colors.
* **Search & Filter:** The "Transactions" page includes a robust search engine. Users can filter their history by keywords, transaction type, specific categories, or date ranges.

## 4. Monthly Budget Management
To prevent overspending, the system offers powerful budgeting tools.
* **Category-Specific Limits:** Users can set a maximum spending limit for a specific category within a given month (e.g., 5000 BDT for Food in March).
* **Visual Progress Bars:** The budget dashboard displays progress bars that fill up as expenses are logged. 
* **Status Indicators:** Budgets are automatically marked as "On Track" (green/orange) or "Over Budget" (red) depending on the percentage of the limit consumed.

## 5. Recurring Bills Tracker
Allows users to manage fixed monthly obligations.
* **Automated Tracking:** Users can log bills like House Rent, Electricity, or Netflix Subscriptions.
* **Due Date Management:** Tracks the `next_due_date` and the frequency of the bill (e.g., Monthly, Yearly).

## 6. Financial Goal Tracker
Encourages users to save money for specific targets (e.g., buying a laptop, going on vacation).
* **Target vs. Current Amount:** Users set a target amount and a deadline.
* **Progress Tracking:** They can deposit money towards the goal, and the UI will render a percentage-based progress ring or bar.
* **Goal Statuses:** Automatically tracks whether a goal is `IN_PROGRESS` or `COMPLETED`.

## 7. Debt and Loan Records
A specialized ledger for tracking money borrowed or lent to friends and family.
* **"I Owe" (Debt) vs. "Owed to Me" (Loan):** Clearly distinguishes between liabilities (money you have to pay back) and assets (money others owe you).
* **Partial Payments:** Users can log partial repayments against a debt. The system automatically recalculates the `remaining_amount`.
* **Status Updates:** Debts shift from `PENDING` to `PARTIALLY_PAID` to `PAID` as payments are made.

## 8. Income vs. Expense Reporting
Provides a high-level summary of financial health.
* **Monthly Aggregation:** The "Reports" tab calculates the Total Income, Total Expense, and Net Savings for the current month.
* **Financial Health Indicators:** If Net Savings is positive, it renders in green. If expenses exceed income, the deficit is highlighted in red, warning the user of bad financial habits.

---

### Technical Highlights (For Faculty Questions)
* **Architecture:** Monolithic REST API Backend serving a Vanilla JS/HTML Frontend.
* **Backend:** Spring Boot (Java 21), leveraging Spring Data JPA for object-relational mapping.
* **Database:** H2 In-Memory Database (configured for rapid development and testing, automatically spins up on launch using `schema.sql` and `data.sql`).
* **Frontend:** No heavy frameworks (React/Angular) are used; the UI relies on pure JavaScript (`app.js`), dynamic DOM manipulation (`innerHTML`), CSS Grid/Flexbox, and the Phosphor Icons library.
