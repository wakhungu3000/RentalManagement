# Nyumba Ledger — Rental Property Management System
Spring Boot 3.3 (Java 17+) · MySQL 8 · plain HTML/CSS/JS pages served by the same application.

```
RentalManagement/
├── pom.xml
├── local.properties.example        copy to local.properties and fill in (your passwords; never shared)
├── database/
│   ├── setup.sql                   step 1: create the database + the app's MySQL user
│   └── schema.sql                  step 2: create the 6 tables
├── src/main/java/com/nyumba/ledger/    domain/ repo/ service/ web/ config/
├── src/main/resources/
│   ├── application.properties          settings (no secrets)
│   ├── application-h2.properties       optional: quick trial without MySQL
│   └── static/                         the pages: login.html, admin-dashboard.html, ... css/ js/
└── ui-preview/                     old browser-only design preview (no Java needed)
```

---
## Set up (Windows) — do these once

### 1. Install MySQL
1. Download **MySQL Installer** from https://dev.mysql.com/downloads/installer/ (the larger "web community" or full installer is fine).
2. Choose **Custom** (or Developer Default) and select **MySQL Server 8.x** and **MySQL Workbench**.
3. When asked, set a **root password** (write it down), keep port **3306**, and let it run as a Windows service.
4. Check it is running: Start menu → **Services** → "MySQL80" → Status *Running*.

### 2. Create the database and the app's account
1. Open `database/setup.sql` in any editor and change `CHANGE_THIS_PASSWORD` to a password of your choice. Remember it.
2. Open **MySQL Workbench** → double-click your local connection → enter the root password.
3. **File → Open SQL Script…** → `database/setup.sql` → click the ⚡ **Execute** button.
4. **File → Open SQL Script…** → `database/schema.sql` → ⚡ Execute.
5. Check: run `USE nyumba; SHOW TABLES;` — you should see 6 tables
   (`houses, invoices, maintenance_requests, payments, tenants, user_accounts`).

*(Command-line alternative, from this folder, in PowerShell:*
`& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source database/setup.sql"` *then the same with* `schema.sql`*.)*

### 3. Tell the app how to reach it
1. Copy `local.properties.example` to **`local.properties`** (same folder as `pom.xml`).
2. Put the password from step 2.1 on the `spring.datasource.password=` line.
3. Leave `app.seed-demo-data=true` for your first test (loads sample houses and tenants). Set it to `false` for real use.

### 4. Run
```
cd "...\RentalManagement"          (the folder that contains pom.xml)
mvn spring-boot:run
```
Wait for `Started NyumbaLedgerApplication`, then open **http://localhost:8080**.
Sign in: owner `owner01` / `admin123` · tenant `tenant01` / `tenant123` (sample data only).

Now the data is kept in MySQL: stop and restart the app and your houses, tenants and invoices are still there.
You can look at them in Workbench: `SELECT * FROM houses;`

**No MySQL yet?** Trial run with a throw-away in-memory database:
`mvn spring-boot:run "-Dspring-boot.run.profiles=h2"` (keep the quotes in PowerShell).

---
## Starting fresh / clearing the sample data
In Workbench (as root): `DROP DATABASE nyumba;` then run `setup.sql`'s `CREATE DATABASE` line and `schema.sql` again.
Set `app.seed-demo-data=false` in `local.properties`, restart. The owner account is created again on start.
(The owner password is only read when the owner row does not exist yet; to change it later, drop the database as above or ask for a "change password" feature.)

## Troubleshooting
| You see | Meaning / fix |
|---|---|
| `Communications link failure` / `Connection refused` | MySQL is not running. Services → MySQL80 → Start. Check port 3306. |
| `Access denied for user 'nyumba_app'` | Wrong password in `local.properties`, or `setup.sql` was not run / password differs. |
| `Unknown database 'nyumba'` | Run `setup.sql` (or `schema.sql`, which also creates the database). |
| `Schema-validation: missing table [...]` or `wrong column type` | `schema.sql` was not run, or an old copy was run. Re-create the database (section above). For a temporary workaround put `spring.jpa.hibernate.ddl-auto=update` in `local.properties`, and send me the message. |
| `Public Key Retrieval is not allowed` | Keep `allowPublicKeyRetrieval=true` in the URL (it is by default). |
| `Incorrect username or password` on the login page for the owner | The owner row may already exist with an older password (the settings only apply when it is first created). Add `app.owner.reset-password=true` to `local.properties`, start the app once, sign in, then remove the line. The start-up log says whether the owner was created, kept or reset. |
| `Port 8080 was already in use` | Another program uses 8080. Add `server.port=8081` to `local.properties`. |

## What the server does
| Service | Where |
|---|---|
| Login, logout, hashed passwords (BCrypt), sessions | `config/SecurityConfig` |
| Owner vs tenant pages; a tenant only receives their own data | `@PreAuthorize` in `web/*`, `service/SnapshotService` |
| Add tenant + create their login; remove tenant + disable login | `service/TenantService` |
| Invoice numbers, invoice-all without duplicates, applying payments to the oldest invoice | `service/BillingService` |
| Validation of every form | `dto/Requests`, services |
| Email/SMS for invoices | `service/NotificationService` (log only for now) |

A payment submitted by a tenant is `pending` until the owner presses **Confirm received**.

## Before real use
- Change `app.owner.password` in `local.properties` **before the first start** on a real database.
- Delete the "Sample accounts" box in `static/login.html`; set `app.seed-demo-data=false`.
- In production give the MySQL user only what it needs (as `setup.sql` does) and never use `root` in the app.
- HTTPS + `server.servlet.session.cookie.secure=true`, and a limit on wrong-password attempts (hosting step).
- Amounts are whole shillings; no cents and no overpayment credit.
- `schema.sql` was written by hand to match the Java classes and has not been run against a live MySQL by me — if a startup check complains, send me the message.
