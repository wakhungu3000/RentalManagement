package com.nyumba.ledger.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

/** A person renting a house. Removed tenants are kept (active=false) so history stays intact. */
@Entity
@Table(name = "tenants")
public class Tenant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 80)
    private String email;

    @Column(name = "id_number", length = 20)
    private String idNo;

    @Column(name = "move_in", nullable = false)
    private LocalDate moveIn;

    /** The house they live in; null once they have moved out. */
    @OneToOne
    @JoinColumn(name = "house_id", unique = true)
    private House house;

    @OneToOne(optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private UserAccount account;

    @Column(nullable = false)
    private boolean active = true;

    protected Tenant() {}

    public Tenant(String name, String phone, String email, String idNo, LocalDate moveIn, House house, UserAccount account) {
        this.name = name; this.phone = phone; this.email = email; this.idNo = idNo;
        this.moveIn = moveIn; this.house = house; this.account = account;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getIdNo() { return idNo; }
    public LocalDate getMoveIn() { return moveIn; }
    public House getHouse() { return house; }
    public void setHouse(House house) { this.house = house; }
    public UserAccount getAccount() { return account; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
