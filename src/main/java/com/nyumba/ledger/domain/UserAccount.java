package com.nyumba.ledger.domain;

import jakarta.persistence.*;

/** A login. Passwords are stored only as BCrypt hashes. */
@Entity
@Table(name = "user_accounts")
public class UserAccount {
    public static final String OWNER = "OWNER";
    public static final String TENANT = "TENANT";

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 10)
    private String role;

    @Column(name = "display_name", nullable = false, length = 80)
    private String displayName;

    @Column(nullable = false)
    private boolean enabled = true;

    protected UserAccount() {}

    public UserAccount(String username, String passwordHash, String role, String displayName) {
        this.username = username; this.passwordHash = passwordHash; this.role = role; this.displayName = displayName;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRole() { return role; }
    public String getDisplayName() { return displayName; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
