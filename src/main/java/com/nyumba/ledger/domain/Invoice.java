package com.nyumba.ledger.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Readable number such as INV-1001, derived from the unique id so two invoices can never share one. */
    @Column(name = "invoice_no", unique = true, length = 20)
    private String no;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Snapshots so the invoice still reads correctly after a tenant moves out.
    @Column(name = "tenant_name", nullable = false, length = 80)
    private String tenantName;
    @Column(name = "house_number", nullable = false, length = 20)
    private String houseNumber;

    @Column(name = "billing_period", nullable = false, length = 60)
    private String period;

    @Column(nullable = false)
    private long amount;

    @Column(nullable = false)
    private long paid;

    @Column(name = "issued_on", nullable = false)
    private LocalDate issued;

    @Column(name = "due_on", nullable = false)
    private LocalDate due;

    @Column(length = 200)
    private String note;

    protected Invoice() {}

    public Invoice(Tenant tenant, String houseNumber, String period, long amount, LocalDate issued, LocalDate due, String note) {
        this.tenant = tenant; this.tenantName = tenant.getName(); this.houseNumber = houseNumber;
        this.period = period; this.amount = amount; this.issued = issued; this.due = due; this.note = note;
    }

    public Long getId() { return id; }
    public String getNo() { return no; }
    public void setNo(String no) { this.no = no; }
    public Tenant getTenant() { return tenant; }
    public String getTenantName() { return tenantName; }
    public String getHouseNumber() { return houseNumber; }
    public String getPeriod() { return period; }
    public long getAmount() { return amount; }
    public long getPaid() { return paid; }
    public void setPaid(long paid) { this.paid = paid; }
    public LocalDate getIssued() { return issued; }
    public LocalDate getDue() { return due; }
    public String getNote() { return note; }
    public long getBalance() { return amount - paid; }
}
