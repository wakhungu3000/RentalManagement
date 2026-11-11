-- STEP 1 of 2: create the database and the account the application uses.
-- Run this once, as the MySQL "root" user (Workbench or the mysql command line).
-- Edit the password below FIRST, and use the same password in local.properties.

CREATE DATABASE IF NOT EXISTS nyumba
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'nyumba_app'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

-- The app only needs to read and change rows, not create or drop tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON nyumba.* TO 'nyumba_app'@'localhost';
FLUSH PRIVILEGES;
