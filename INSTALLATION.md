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

---

## 3. Run as a JAR (for production-like local testing)

```bash
./mvnw clean package -DskipTests
java -jar target/taka-bachai-0.0.1-SNAPSHOT.jar
```

To run the production profile (no H2 console, quiet logs):

```bash
SPRING_PROFILES_ACTIVE=prod java -jar target/taka-bachai-0.0.1-SNAPSHOT.jar
```

On Windows PowerShell:

```powershell
$env:SPRING_PROFILES_ACTIVE="prod"; java -jar target\taka-bachai-0.0.1-SNAPSHOT.jar
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
4. (Optional) add `APP_UPLOAD_DIR=/var/data/uploads` and a Render disk to persist receipts across restarts.

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

1. Create a Supabase project.
2. Go to **Project Settings -> Database** and copy credentials.
3. Set these environment variables before starting the app:

```bash
SPRING_PROFILES_ACTIVE=prod
SUPABASE_DB_JDBC_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=<your-db-password>
```

4. In Supabase SQL Editor, run `src/main/resources/schema.sql` once.
5. Optional: run `src/main/resources/data.sql` once to load demo records.

`application-prod.properties` sets `spring.sql.init.mode=never` by default so persistent Supabase data is not re-initialized on every restart.

---

## 7. Configuration reference

| Property / Env var          | Default               | Description |
|-----------------------------|-----------------------|-------------|
| `SERVER_PORT` / `PORT`      | `8080`                | HTTP port. Render injects `PORT`. |
| `SPRING_PROFILES_ACTIVE`    | `dev`                 | `dev` or `prod`. |
| `SUPABASE_DB_JDBC_URL`      | *(none)*              | Supabase PostgreSQL JDBC URL. |
| `SUPABASE_DB_USER`          | `postgres`            | Supabase DB username. |
| `SUPABASE_DB_PASSWORD`      | *(none)*              | Supabase DB password. |
| `SPRING_SQL_INIT_MODE`      | `never` (prod)        | Set `always` only for one-time schema/data bootstrap. |
| `APP_UPLOAD_DIR`            | `./uploads`           | Where receipt images are stored. |

---

## 8. Troubleshooting

| Symptom | Fix |
|--------|-----|
| `Port 8080 already in use` | `SERVER_PORT=8081 ./mvnw spring-boot:run` (or stop the other process). |
| Receipts not saving | Make sure the user running Java has write access to `APP_UPLOAD_DIR`. |
| Browser shows old assets after a code change | Hard reload (`Ctrl+F5` / `Cmd+Shift+R`) — the static files are cached aggressively in some browsers. |
| Build fails with *Unsupported class file major version* | You're running an older JDK; install Java 21 and ensure `JAVA_HOME` points to it. |
| In dev profile, `/h2-console` returns 404 | The app may have started under the `prod` profile. Restart with `SPRING_PROFILES_ACTIVE=dev`. |
