# Taka Bachai - Detailed Feature Documentation

Welcome to the comprehensive feature guide for the **Taka Bachai** Personal Money Management System. This document is designed to help team members quickly understand the full scope of the project's capabilities, making it easier to answer technical and functional questions during university presentations.

---

## 1. Admin and User Database
Taka Bachai supports a robust multi-user environment with an integrated authorization layer.
* **User Switching:** Users can seamlessly switch between profiles using the dropdown on the homepage (simulated login environment). Data is strictly isolated per user; User A cannot see User B's transactions or wallets.
* **Role Management:** The system features a built-in authorization layer based on user roles (`ADMIN` and `USER`).
* **Admin Dashboard:** Users with the `ADMIN` role (e.g., the primary user) are granted access to an exclusive "Admin Panel". This panel allows the administrator to view all registered users in the database, create new users, assign roles, and delete accounts directly from the UI.

## 2. Multi-Wallet Support
Users are not restricted to a single monolithic balance. They can distribute their money across various distinct accounts.
* **Wallet Types:** Supports Cash, Mobile Banking (bKash, Nagad, Rocket), Bank Accounts, and Credit Cards.
* **Net Worth Calculation:** The dashboard intelligently aggregates the balances across all wallets to calculate the user's total Net Worth.
* **Dynamic Updates:** Whenever a transaction is logged, the associated wallet's balance is automatically updated in real-time.

## 3. Transaction Logging
The core functionality of the platform revolves around tracking daily cash flow.
* **Income & Expense Tracking:** Users can log both incoming money and outgoing expenses effortlessly.
* **Detailed Records:** Each transaction captures the specific wallet used, the date, the exact amount, and an optional text description.

## 4. Expense Categorization
Every transaction is systematically organized to help users understand their spending habits.
* **Category Association:** Every transaction is tied to a specific category (e.g., Food, Rent, Salary, Freelance).
* **Visual Identity:** Categories are represented by visual emojis and distinctive colors in the UI, making the transaction list easy to scan.

## 5. Transaction History Search
Finding a specific past transaction is incredibly fast thanks to the robust search engine.
* **Keyword Search:** Users can type a keyword into the search bar, and the system queries the backend to filter transactions in real-time.
* **Advanced Filtering:** Transactions can also be filtered by specific types (Income/Expense), selected categories, or customized date ranges.

## 6. Monthly Budget Limits
To prevent overspending, the system offers powerful proactive budgeting tools.
* **Category-Specific Limits:** Users can set a maximum spending limit for a specific category within a given month (e.g., 5000 BDT for Food in March).
* **Visual Progress Bars:** The budget dashboard displays progress bars that dynamically fill up as relevant expenses are logged. 
* **Status Indicators:** Budgets are automatically marked as "On Track" (green/orange) or "Over Budget" (red) depending on the percentage of the limit consumed.

## 7. Recurring Bills
Allows users to manage and anticipate fixed monthly obligations.
* **Automated Tracking:** Users can log consistent bills like House Rent, Electricity, or Netflix Subscriptions.
* **Due Date Management:** The system tracks the `next_due_date` and the frequency of the bill (e.g., Monthly, Yearly), ensuring users never miss a payment.

## 8. Financial Goal Tracker
Encourages users to save money for specific long-term targets (e.g., buying a laptop, going on vacation).
* **Target vs. Current Amount:** Users set a monetary target amount and a specific deadline.
* **Progress Tracking:** They can deposit money towards the goal, and the UI will render a visual percentage-based progress bar.
* **Goal Statuses:** The system automatically updates whether a goal is `IN_PROGRESS` or `COMPLETED`.

## 9. Debt and Loan Record
A specialized ledger for tracking money borrowed from or lent to friends and family.
* **"I Owe" (Debt) vs. "Owed to Me" (Loan):** Clearly distinguishes between liabilities (money you have to pay back) and assets (money others owe you).
* **Partial Payments:** Users can log partial repayments against a debt. The system automatically recalculates the `remaining_amount`.
* **Status Updates:** Debts shift autonomously from `PENDING` to `PARTIALLY_PAID` to `PAID` as payments are made over time.

## 10. Income vs. Expense Report
Provides a high-level summary of the user's financial health and monthly performance.
* **Monthly Aggregation:** The "Reports" tab automatically calculates the Total Income, Total Expense, and Net Savings for the current month.
* **Financial Health Indicators:** If Net Savings is positive, it renders in green. If expenses exceed income, the deficit is highlighted in red, warning the user of bad financial habits.

## 11. <mark>Advanced Admin Financial Summary (Complex SQL: OUTER JOIN & Subqueries)</mark>
An advanced data aggregation feature built specifically for platform administrators.
* **Global Wealth & Debt Overview:** The Admin Panel doesn't just list users; it dynamically calculates the total combined wallet balance and total outstanding debts for every single user in the system.
* **Complex Data Mapping:** Powered by highly complex `LEFT OUTER JOIN`s on nested aggregated `Subqueries` to ensure data integrity (preventing cartesian products when users have multiple wallets and debts simultaneously).

## 12. <mark>Spending Insights vs. Platform Average (Complex SQL: INNER JOIN & Subqueries)</mark>
An intelligent financial analytics tool available to all users in their Reports dashboard.
* **Behavioral Warnings:** Analyzes a user's spending habits and explicitly warns them if they are spending significantly more in a specific category compared to the average user on the platform.
* **Advanced Querying:** Driven by a native `INNER JOIN` between the transactions and categories tables, utilizing deeply nested `Subqueries` in the `SELECT` and `HAVING` clauses to calculate the dynamic platform-wide averages on the fly.

---

### Technical Highlights (For Faculty Questions)
* **Architecture:** Monolithic REST API Backend serving a Vanilla JS/HTML Frontend.
* **Backend:** Spring Boot (Java 21), leveraging Spring Data JPA for object-relational mapping.
* **Database:** H2 In-Memory Database (configured for rapid development and testing, automatically spins up on launch using `schema.sql` and `data.sql`).
* **Frontend:** No heavy frameworks (React/Angular) are used; the UI relies on pure JavaScript (`app.js`), dynamic DOM manipulation (`innerHTML`), CSS Grid/Flexbox, and the Phosphor Icons library.
