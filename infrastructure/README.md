# Infrastructure Module - Database & Migration Workflow

This module contains the persistence layer for **Endless Workshop**, including database mappings, repositories, and Flyway migration scripts.


---

## Database Profiles

The application uses **Spring profiles** to manage different environments:

| Profile   | Database                          | Flyway Migrations                 | Notes |
|-----------|----------------------------------|----------------------------------|-------|
| `dev`     | H2 in-memory (PostgreSQL mode)   | `db/migration/dev`               | Fast local development. No production data. |
| `staging` | Neon PostgreSQL (staging branch) | `db/migration/staging`           | Testing new scripts & data before production. |
| `prod`    | Neon PostgreSQL (main branch)    | `db/migration/prod`              | Production database. Only applies new migrations. |

---

## Workflow

### 1. Development (Local)

- Use the `dev` profile.
- Database: **H2 in-memory**, configured to PostgreSQL compatibility mode (`MODE=PostgreSQL`).
- Flyway migrations run **against H2** to create tables and insert seed data.
- Fast iteration for development and testing new features.

### 2. Staging / Test

- Use the `staging` profile.
- Database: Neon PostgreSQL **staging branch**.
- Flyway migrations run automatically when the app starts.
- Purpose: Verify new migrations, test new features, and validate data integrity.
- **Safe environment**: staging branch is isolated from production.

### 3. Production

- Use the `prod` profile.
- Database: Neon PostgreSQL **main branch**.
- Flyway applies **only new migrations** that haven’t been run yet (tracked in `flyway_schema_history` table).
- Ensure all new migrations and code are merged to the main branch **before deployment**.

---

## Migration Flow Diagram

```text
Local Dev (H2)
      |
      v (write code + new Flyway scripts)
Staging Branch (Neon)
      |  run app, verify migrations & data
      v
Prod Branch (Neon)
      |  run app, Flyway applies any new migrations
