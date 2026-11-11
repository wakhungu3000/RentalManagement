-- STEP 2 of 2: create the tables. Run after setup.sql, as root (or any account that may create tables).
-- Written to match the Java classes in src/main/java/com/nyumba/ledger/domain.
-- Money is stored as whole Kenya shillings (BIGINT). Needs MySQL 8.0.16+ (CHECK rules are enforced).

CREATE DATABASE IF NOT EXISTS nyumba CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nyumba;

-- Everyone who can log in (the owner and each tenant). Passwords are BCrypt hashes, never plain text.
CREATE TABLE user_accounts (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    username     -   VARCHAR(50)  NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(10)  NOT NULL,
    display_name    VARCHAR(80)  NOT NULL,
    enabled         BIT(1)       NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_accounts_username (username),
    CONSTRAINT ck_user_accounts_role CHECK (role IN ('OWNER', 'TENANT'))
) ENGINE=InnoDB;

CREATE TABLE houses (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    house_number    VARCHAR(20)  NOT NULL,
    house_type      VARCHAR(40)  NOT NULL,
    location        VARCHAR(60)  NOT NULL,
    rent            BIGINT       NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_houses_number (house_number),
    CONSTRAINT ck_houses_rent CHECK (rent > 0)
) ENGINE=InnoDB;

-- A person renting a house. A removed tenant keeps their row (active = 0, house_id = NULL) so history stays intact.
CREATE TABLE tenants (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    name            VARCHAR(80)  NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    email           VARCHAR(80)  NULL,
    id_number       VARCHAR(20)  NULL,
    move_in         DATE         NOT NULL,
    house_id        BIGINT       NULL,
    account_id      BIGINT       NOT NULL,
    active          BIT(1)       NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tenants_house (house_id),        -- one current tenant per house
    UNIQUE KEY uq_tenants_account (account_id),
    CONSTRAINT fk_tenants_house   FOREIGN KEY (house_id)   REFERENCES houses (id),
    CONSTRAINT fk_tenants_account FOREIGN KEY (account_id) REFERENCES user_accounts (id)
) ENGINE=InnoDB;

CREATE TABLE invoices (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    invoice_no      VARCHAR(20)  NULL,             -- INV-1001 ... set by the app from the unique id
    tenant_id       BIGINT       NOT NULL,
    tenant_name     VARCHAR(80)  NOT NULL,         -- copied, so old invoices still read correctly
    house_number    VARCHAR(20)  NOT NULL,
    billing_period  VARCHAR(60)  NOT NULL,
    amount          BIGINT       NOT NULL,
    paid            BIGINT       NOT NULL,
    issued_on       DATE         NOT NULL,
    due_on          DATE         NOT NULL,
    note            VARCHAR(200) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invoices_no (invoice_no),
    KEY ix_invoices_tenant (tenant_id),
    CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT ck_invoices_amount CHECK (amount > 0),
    CONSTRAINT ck_invoices_paid   CHECK (paid >= 0 AND paid <= amount)
) ENGINE=InnoDB;

-- "pending" = a tenant says they paid and the owner has not confirmed yet; "paid" = counted against invoices.
CREATE TABLE payments (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT       NOT NULL,
    tenant_name     VARCHAR(80)  NOT NULL,
    house_number    VARCHAR(20)  NOT NULL,
    amount          BIGINT       NOT NULL,
    paid_on         DATE         NOT NULL,
    method          VARCHAR(20)  NOT NULL,
    payment_ref     VARCHAR(30)  NULL,
    status          VARCHAR(10)  NOT NULL,
    PRIMARY KEY (id),
    KEY ix_payments_tenant (tenant_id),
    CONSTRAINT fk_payments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT ck_payments_amount CHECK (amount > 0),
    CONSTRAINT ck_payments_status CHECK (status IN ('paid', 'pending'))
) ENGINE=InnoDB;

CREATE TABLE maintenance_requests (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    tenant_id       BIGINT       NOT NULL,
    tenant_name     VARCHAR(80)  NOT NULL,
    house_number    VARCHAR(20)  NOT NULL,
    category        VARCHAR(40)  NOT NULL,
    priority        VARCHAR(10)  NOT NULL,
    problem         VARCHAR(500) NOT NULL,
    reported_on     DATE         NOT NULL,
    status          VARCHAR(20)  NOT NULL,
    PRIMARY KEY (id),
    KEY ix_requests_tenant (tenant_id),
    CONSTRAINT fk_requests_tenant   FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT ck_requests_priority CHECK (priority IN ('Low', 'Normal', 'Urgent')),
    CONSTRAINT ck_requests_status   CHECK (status IN ('pending', 'in progress', 'resolved'))
) ENGINE=InnoDB;
