# Taka Bachai — Personal Finance Manager

A full-stack personal money management system built for Bangladesh, featuring multi-wallet tracking (Cash / bKash / Nagad / Bank / Credit Card), categorised transactions, monthly budgets, recurring bills, savings goals, debt & loan tracking, an admin panel and a reports module that surfaces spending insights against the platform-wide average.

> Course project for **CSE 370 — Database Systems**.
> Tech stack: Spring Boot 3 (Java 21) · Spring Data JPA · H2 (PostgreSQL mode) · Vanilla HTML / CSS / JS · Chart.js.

---

## Highlights

- **One application, one server.** The Spring Boot backend serves the REST API at `/api/**` and the static frontend (`index.html`, `app.js`, `style.css`) from the same origin — no CORS plumbing required.
- **Course requirements covered.**
  - `vw_user_financial_summary` — uses `LEFT OUTER JOIN` on nested aggregate subqueries to surface per-user balances and outstanding debt without Cartesian products.
  - `vw_spending_insights` — uses `INNER JOIN` plus a nested subquery in the `HAVING` clause to find users who spend above the platform average per category.
- **Production-ready hygiene.** Centralised `GlobalExceptionHandler`, validation annotations on every entity, ownership checks in services, parameterised JPA queries, automatic `created_at` timestamps, distinct dev/prod Spring profiles, and a Dockerfile that boots cleanly on Render.
- **Polished UX.** Toast notifications, modal close on overlay click / Esc, edit & delete buttons on every record, real net-worth chart computed from your transaction history, search & filters on the Transactions page, mobile-responsive layout, and a print-friendly Reports page.

---

## Quick start

### Prerequisites

| Tool   | Version                |
|--------|------------------------|
| JDK    | 21+                    |
| Maven  | (Use the bundled wrapper, no install needed) |

### Run locally

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows (PowerShell or cmd)
.\mvnw.cmd spring-boot:run
```

Then open <http://localhost:8080>.

### Build a runnable JAR

```bash
./mvnw clean package -DskipTests
java -jar target/taka-bachai-0.0.1-SNAPSHOT.jar
```

### Build & run with Docker

```bash
docker build -t taka-bachai .
docker run -p 8080:8080 taka-bachai
```

---

## Profiles

The app ships with two Spring profiles:

| Profile | When to use                     | Effect                                                                 |
|---------|---------------------------------|------------------------------------------------------------------------|
| `dev`   | local development (default)     | Enables the H2 console at `/h2-console`, verbose SQL logging.          |
| `prod`  | production / Render / Docker    | Disables the H2 console, suppresses SQL logging and stack traces.      |

Switch via env var:

```bash
SPRING_PROFILES_ACTIVE=prod java -jar target/taka-bachai-0.0.1-SNAPSHOT.jar
```

The Dockerfile already sets `SPRING_PROFILES_ACTIVE=prod` by default.

---

## Switching to PostgreSQL / Supabase

Open `src/main/resources/application.properties` and uncomment the PostgreSQL block, supplying your connection details. The schema and seed data files (`schema.sql`, `data.sql`) are written in PostgreSQL syntax (`BIGSERIAL`, `BOOLEAN DEFAULT TRUE`, etc.) so they work unchanged.

---

## Project layout

```
src/main/
├── java/com/takabachai/
│   ├── TakaBachaiApplication.java
│   ├── config/        # CORS, GlobalExceptionHandler
│   ├── controller/    # REST endpoints
│   ├── dto/           # Request / response shapes
│   ├── exception/     # Domain exceptions (mapped by GlobalExceptionHandler)
│   ├── model/         # JPA entities with Bean Validation
│   ├── repository/    # Spring Data JPA + native query views
│   └── service/       # Transactional business logic
└── resources/
    ├── application.properties        # base config
    ├── application-dev.properties    # H2 console + verbose SQL
    ├── application-prod.properties   # quiet, secure
    ├── schema.sql                    # tables, indexes, views
    ├── data.sql                      # seed data (10 users)
    └── static/                       # frontend (index.html, app.js, style.css, logo.png)
```

---

## API reference (summary)

All endpoints are JSON, prefixed with `/api`.

| Resource           | Endpoints                                                                                  |
|--------------------|--------------------------------------------------------------------------------------------|
| Users              | `GET /users`, `GET/PUT/DELETE /users/{id}`, `POST /users`, `GET /users/admin/summary`     |
| Wallets            | `GET /wallets/user/{userId}`, full CRUD on `/wallets/{id}`                                 |
| Transactions       | CRUD on `/transactions`, plus `GET /transactions/user/{userId}/search?...` (combinable filters: `keyword`, `type`, `categoryId`, `startDate`, `endDate`) and `POST /transactions/{id}/receipt` |
| Categories         | CRUD on `/categories`, `GET /categories/type/{INCOME|EXPENSE}`                             |
| Budgets            | CRUD on `/budgets`, `GET /budgets/user/{userId}/status/{YYYY-MM}` (live limit vs spend)    |
| Recurring Bills    | CRUD on `/recurring-bills`, plus `/active` and `/overdue` views                            |
| Goals              | CRUD on `/goals`, `POST /goals/{id}/add` to record a contribution                          |
| Debts / Loans      | CRUD on `/debts`, `POST /debts/{id}/pay` to make a payment                                 |
| Reports            | `GET /reports/user/{userId}/monthly/{YYYY-MM}`, `GET /reports/user/{userId}/insights`     |

Validation errors come back as JSON:

```json
{
  "timestamp": "2026-04-27T19:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "amount must be greater than 0"
}
```

---

## Development tips

- **Reset the data.** Restart the app — H2 is in-memory, so `schema.sql` + `data.sql` re-seed on every boot.
- **Inspect the DB.** With the `dev` profile, browse to <http://localhost:8080/h2-console> and connect to `jdbc:h2:mem:takabachaidb` (user `sa`, no password).
- **Custom upload directory.** Set `APP_UPLOAD_DIR=/path/to/uploads` to control where receipt images are written.

---

## License

Course project; not licensed for production use without permission.
