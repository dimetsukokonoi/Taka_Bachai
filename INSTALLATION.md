# Taka Bachai - Installation & Deployment Guide

This guide provides step-by-step instructions on how to set up, build, and run the **Taka Bachai** personal finance system on your local machine. Because this project is self-contained (using an in-memory database), you do not need to install complex external database servers like MySQL or PostgreSQL.

---

## Prerequisites

Before running the project, ensure your system has the following installed:

1. **Java Development Kit (JDK) 21**
   - The backend is built on Spring Boot 3.5.13 and requires **Java 21**.
   - You can download it from [Oracle](https://www.oracle.com/java/technologies/downloads/#java21) or use an open-source distribution like [Adoptium Eclipse Temurin](https://adoptium.net/).
   - To verify your installation, open a terminal and run:
     ```bash
     java -version
     ```

2. **Git** (Optional, but recommended for version control)
   - [Download Git](https://git-scm.com/downloads)

*(Note: You do **not** need Node.js or npm to run the Taka Bachai website, as the frontend uses Vanilla HTML/JS served directly by the Spring Boot server).*

---

## Running the Project Locally

The project uses **Maven** for dependency management and building. We have included a "Maven Wrapper" (`mvnw` for Linux/Mac, `mvnw.cmd` for Windows) inside the project folder so that you don't even need to install Maven globally.

### Step 1: Open the Project Directory
Extract the project files (or clone the repository) and open your terminal (Command Prompt, PowerShell, or Bash) inside the `Taka_Bachai` folder:
```bash
cd path/to/Taka_Bachai
```

### Step 2: Clean and Build Dependencies
Run the following command to download all necessary Spring Boot dependencies (this requires an active internet connection and may take a few minutes the first time):

**On Windows:**
```cmd
.\mvnw.cmd clean install -DskipTests
```

**On Mac / Linux:**
```bash
./mvnw clean install -DskipTests
```

### Step 3: Launch the Application
Once the build is successful, you can start the Spring Boot server:

**On Windows:**
```cmd
.\mvnw.cmd spring-boot:run
```

**On Mac / Linux:**
```bash
./mvnw spring-boot:run
```

*(Alternative: If the wrapper scripts fail on your system, you can manually install [Apache Maven](https://maven.apache.org/download.cgi) and simply run `mvn spring-boot:run`)*.

---

## Accessing the Application

Once the terminal output shows `Started TakaBachaiApplication in ... seconds`, the server is successfully running.

1. Open any modern web browser (Chrome, Edge, Firefox).
2. Navigate to: **[http://localhost:8080](http://localhost:8080)**
3. You will see the Taka Bachai homepage.
4. **Login:** There are 10 pre-configured accounts. Select an account from the dropdown menu (e.g., "Rahim Uddin") and click "Enter Dashboard".
   * *Note: The first user (Rahim Uddin) is configured as the **Admin** and will have access to the Admin Panel in the sidebar.*

---

## Database Configuration (H2 In-Memory)

By default, the application is configured to use the **H2 In-Memory Database** for ease of use.
* **Seeding:** The database is automatically created and populated with sample data every time you launch the application. This is controlled by `schema.sql` and `data.sql` located in `src/main/resources/`.
* **Data Persistence:** Because it is an in-memory database, **any new data you enter (new users, transactions) will be wiped out when you restart the server.** This is ideal for university presentations as you always start with a clean state.
* **H2 Console:** You can inspect the database tables manually by going to `http://localhost:8080/h2-console` in your browser. 
   - JDBC URL: `jdbc:h2:mem:takabachaidb`
   - Username: `sa`
   - Password: *(leave blank)*
