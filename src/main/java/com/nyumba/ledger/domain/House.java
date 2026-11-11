package com.nyumba.ledger.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "houses")
public class House {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "house_number", nullable = false, unique = true, length = 20)
    private String number;

    @Column(name = "house_type", nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 60)
    private String location;

    /** Monthly rent in whole Kenya shillings. */
    @Column(nullable = false)
    private long rent;

    protected House() {}

    public House(String number, String type, String location, long rent) {
        this.number = number; this.type = type; this.location = location; this.rent = rent;
    }

    public Long getId() { return id; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public long getRent() { return rent; }
    public void setRent(long rent) { this.rent = rent; }
}
