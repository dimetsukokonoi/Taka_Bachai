# Taka Bachai — Installation & Deployment Guide

This guide walks you through setting up, building, running and (optionally) deploying **Taka Bachai**, a personal finance system that ships with its own database, frontend and REST API in a single Spring Boot application.

---

## 1. Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| **JDK** | 21+ | Spring Boot 3 requires Java 21. Use [Adoptium Temurin](https://adoptium.net/) or Oracle JDK. |
| **Git** | any | Optional — only needed if you clone the repository. |
| **Docker** | any | Optional — only needed for the container deployment route. |

You do **not** need to install Maven separately — the project ships with the Maven Wrapper (`mvnw` / `mvnw.cmd`).

You do **not** need Node.js — the frontend is plain HTML / CSS / JavaScript served by Spring Boot.

Verify Java is on your PATH:

```bash
java -version
```

You should see `21` (or higher).

---

## 2. Run locally (recommended for development / demos)

### Step 1 — Open a terminal in the project root

```bash
cd path/to/Taka_Bachai
```

### Step 2 — Build dependencies (first run only)

**Windows (PowerShell or cmd):**
```bat
.\mvnw.cmd clean install -DskipTests
```

**macOS / Linux:**
```bash
./mvnw clean install -DskipTests
```

### Step 3 — Launch the server

**Windows:**
```bat
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**
```bash
./mvnw spring-boot:run
```

When you see `Started TakaBachaiApplication in X.XXX seconds`, open **<http://localhost:8080>**.

> If the wrapper scripts fail (e.g. on a locked-down Windows machine), install [Apache Maven](https://maven.apache.org/download.cgi) and run `mvn spring-boot:run` instead.

> **Want to run against your own Supabase database instead of the in-memory H2 demo?** Skip ahead to **Section 6 → "Switch to PostgreSQL or Supabase"**, then run `./run-prod.sh`.

---

## 3. Run as a JAR (for production-like local testing)

```bash
./mvnw clean package -DskipTests
java -jar target/taka-bachai-0.0.1-SNAPSHOT.jar
```

To run the production profile (no H2 console, quiet logs) against your Supabase database, fill in `.env` (see **Section 6**) and either source it manually or use the helper script:

```bash
./mvnw clean package -DskipTests
set -a; source .env; set +a
java -jar target/taka-bachai-0.0.1-SNAPSHOT.jar
```

On Windows PowerShell:

```powershell
.\mvnw.cmd clean package -DskipTests
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process') }
}
java -jar target\taka-bachai-0.0.1-SNAPSHOT.jar
```

---

## 4. Run with Docker

The repository contains a multi-stage `Dockerfile` that produces a slim runtime image and respects the `$PORT` environment variable used by Render, Railway and Fly.io.

```bash
docker build -t taka-bachai .
docker run --rm -p 8080:8080 taka-bachai
```

To deploy on **Render**:

1. Push the repo to GitHub.
2. Create a new *Web Service* on Render, selecting "Deploy from a Dockerfile".
3. Render automatically supplies `PORT`, and the Dockerfile already sets `SPRING_PROFILES_ACTIVE=prod`.
4. In the Render service's **Environment** tab, add the same variables you'd put in `.env` (see Section 6):
   - `SUPABASE_DB_JDBC_URL` — the **Session pooler** URL (`jdbc:postgresql://aws-<n>-<region>.pooler.supabase.com:5432/postgres?sslmode=require`). Render's free / starter dynos do not have IPv6 egress, so the direct Supabase host will fail there with `Network is unreachable` — always use the pooler.
   - `SUPABASE_DB_USER` — `postgres.<project-ref>`
   - `SUPABASE_DB_PASSWORD` — your Supabase DB password (mark it as a *secret* in Render).
5. (Optional) add `APP_UPLOAD_DIR=/var/data/uploads` and a Render disk to persist receipts across restarts.

---

## 5. Accessing the application

1. Open any modern browser (Chrome, Edge, Firefox, Safari).
2. Visit <http://localhost:8080>.
3. The home page lists 10 pre-seeded users. Pick one and click **Enter Dashboard**.
4. The first user (Rahim Uddin) is the **admin** and has access to the *Admin* panel in the sidebar.

---

## 6. Database

By default the app runs an **H2 in-memory** database in PostgreSQL compatibility mode.

- The schema is created from `src/main/resources/schema.sql`.
- Sample data is loaded from `src/main/resources/data.sql`.
- Data is reset on every restart — ideal for demos and presentations.

### H2 console (dev profile only)

The H2 console is available at <http://localhost:8080/h2-console> when running with the `dev` profile (the default).

| Field | Value |
|-------|-------|
| JDBC URL | `jdbc:h2:mem:takabachaidb` |
| User name | `sa` |
| Password | *(leave blank)* |

### Switch to PostgreSQL or Supabase

> **Important — use the Supavisor pooler URL, not the direct DB host.**
> Supabase's *direct* host (`db.<project-ref>.supabase.co`) is **IPv6-only**. Most home / office networks (and many cloud providers) don't have a working IPv6 route, which causes the JVM to fail with `java.net.SocketException: Network is unreachable` at startup. The **Session pooler** (Supavisor) endpoint `aws-<n>-<region>.pooler.supabase.com` is dual-stack (IPv4 + IPv6) and works everywhere.

1. Create a Supabase project.
2. In the Supabase dashboard, go to **Project Settings → Database → Connection string** and select the **Session pooler** tab. Copy the connection string — it looks like:

   ```
   postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-<n>-<region>.pooler.supabase.com:5432/postgres
   ```

3. Copy `.env.example` to `.env` and fill it in (`.env` is gitignored):

   ```bash
   cp .env.example .env
   ```

   ```bash
   # .env
   SPRING_PROFILES_ACTIVE=prod
   SUPABASE_DB_JDBC_URL=jdbc:postgresql://aws-<n>-<region>.pooler.supabase.com:5432/postgres?sslmode=require
   SUPABASE_DB_USER=postgres.<project-ref>
   SUPABASE_DB_PASSWORD=<your-db-password>
   SPRING_SQL_INIT_MODE=never
   ```

   Notes:
   - The JDBC URL is the pooler URL **with** a `jdbc:` prefix and `?sslmode=require` appended.
   - The username is `postgres.<project-ref>` (Supavisor encodes the project ref into the user, not the host).
   - Use port **`5432`** (Session pooler) for Spring Boot / JPA. Port `6543` (Transaction pooler) is *not* recommended for JPA because it disables session-level features such as prepared statement caching.

4. **First-time schema bootstrap (only once per project):**
   - In Supabase SQL Editor, paste and run `src/main/resources/schema.sql`.
   - Optional: run `src/main/resources/data.sql` to load 10 demo users and sample records.

5. Run the app:

   ```bash
   ./run-prod.sh
   ```

   The script sources `.env` and then runs `./mvnw spring-boot:run`. On Windows, run the equivalent in PowerShell:

   ```powershell
   Get-Content .env | ForEach-Object {
     if ($_ -match '^\s*([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process') }
   }
   .\mvnw.cmd spring-boot:run
   ```

`application-prod.properties` sets `spring.sql.init.mode=never` by default so persistent Supabase data is not re-initialized on every restart. Set `SPRING_SQL_INIT_MODE=always` in `.env` *only* for a one-time bootstrap, then change it back to `never`.

---

## 7. Configuration reference

| Property / Env var          | Default               | Description |
|-----------------------------|-----------------------|-------------|
| `SERVER_PORT` / `PORT`      | `8080`                | HTTP port. Render injects `PORT`. |
| `SPRING_PROFILES_ACTIVE`    | `dev`                 | `dev` or `prod`. |
| `SUPABASE_DB_JDBC_URL`      | *(none)*              | JDBC URL of the Supabase **Session pooler** (`jdbc:postgresql://aws-<n>-<region>.pooler.supabase.com:5432/postgres?sslmode=require`). |
| `SUPABASE_DB_USER`          | `postgres`            | Supabase DB username. With the pooler this is `postgres.<project-ref>`. |
| `SUPABASE_DB_PASSWORD`      | *(none)*              | Supabase DB password. |
| `SPRING_SQL_INIT_MODE`      | `never` (prod)        | Set `always` only for one-time schema/data bootstrap. |
| `APP_UPLOAD_DIR`            | `./uploads`           | Where receipt images are stored. |

For local development the recommended workflow is to put these in a `.env` file (gitignored — see `.env.example`) and start the app with `./run-prod.sh`.

---

## 8. Troubleshooting

| Symptom | Fix |
|--------|-----|
| `Port 8080 already in use` | `SERVER_PORT=8081 ./mvnw spring-boot:run` (or stop the other process). |
| Receipts not saving | Make sure the user running Java has write access to `APP_UPLOAD_DIR`. |
| Browser shows old assets after a code change | Hard reload (`Ctrl+F5` / `Cmd+Shift+R`) — the static files are cached aggressively in some browsers. |
| Build fails with *Unsupported class file major version* | You're running an older JDK; install Java 21 and ensure `JAVA_HOME` points to it. |
| In dev profile, `/h2-console` returns 404 | The app may have started under the `prod` profile. Restart with `SPRING_PROFILES_ACTIVE=dev`. |
| Startup fails with `org.postgresql.util.PSQLException: The connection attempt failed` → `java.net.SocketException: Network is unreachable` | Your `SUPABASE_DB_JDBC_URL` is using the IPv6-only direct host (`db.<project-ref>.supabase.co`). Switch to the **Session pooler** URL (`aws-<n>-<region>.pooler.supabase.com:5432`) and set `SUPABASE_DB_USER=postgres.<project-ref>` — see Section 6. |
| UI shows "Server Offline" / red toast `Could not open JPA EntityManager for transaction` | The DB connection is broken. Check the server log for the underlying cause; most commonly it's the IPv6 / pooler issue above, an expired/rotated DB password, or Supabase project paused (free tier auto-pauses after a week of inactivity — un-pause it from the dashboard). |
| `password authentication failed for user "postgres"` | When using the Supavisor pooler, the username must be `postgres.<project-ref>` (note the dot and project ref). The plain `postgres` user only works on the direct host. |
| `FATAL: Tenant or user not found` | Same root cause as above — the pooler couldn't map your username to a project. Double-check `SUPABASE_DB_USER=postgres.<project-ref>`. |
