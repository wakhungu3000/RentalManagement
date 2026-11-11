package com.nyumba.ledger.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "tenant_name", nullable = false, length = 80)
    private String tenantName;
    @Column(name = "house_number", nullable = false, length = 20)
    private String houseNumber;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(nullable = false, length = 10)
    private String priority;

    @Column(name = "problem", nullable = false, length = 500)
    private String description;

    @Column(name = "reported_on", nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 20)
    private String status;

    protected MaintenanceRequest() {}

    public MaintenanceRequest(Tenant tenant, String houseNumber, String category, String priority, String description, LocalDate date, String status) {
        this.tenant = tenant; this.tenantName = tenant.getName(); this.houseNumber = houseNumber;
        this.category = category; this.priority = priority; this.description = description; this.date = date; this.status = status;
    }

    public Long getId() { return id; }
    public Tenant getTenant() { return tenant; }
    public String getTenantName() { return tenantName; }
    public String getHouseNumber() { return houseNumber; }
    public String getCategory() { return category; }
    public String getPriority() { return priority; }
    public String getDescription() { return description; }
    public LocalDate getDate() { return date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
