package com.nyumba.ledger.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
public class Payment {
    public static final String PAID = "paid";
    public static final String PENDING = "pending";

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "tenant_name", nullable = false, length = 80)
    private String tenantName;
    @Column(name = "house_number", nullable = false, length = 20)
    private String houseNumber;

    @Column(nullable = false)
    private long amount;

    @Column(name = "paid_on", nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 20)
    private String method;

    @Column(name = "payment_ref", length = 30)
    private String ref;

    /** "pending" = reported but not yet confirmed by the owner; "paid" = counted against invoices. */
    @Column(nullable = false, length = 10)
    private String status;

    protected Payment() {}

    public Payment(Tenant tenant, String houseNumber, long amount, LocalDate date, String method, String ref, String status) {
        this.tenant = tenant; this.tenantName = tenant.getName(); this.houseNumber = houseNumber;
        this.amount = amount; this.date = date; this.method = method; this.ref = ref; this.status = status;
    }

    public Long getId() { return id; }
    public Tenant getTenant() { return tenant; }
    public String getTenantName() { return tenantName; }
    public String getHouseNumber() { return houseNumber; }
    public long getAmount() { return amount; }
    public LocalDate getDate() { return date; }
    public String getMethod() { return method; }
    public String getRef() { return ref; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
