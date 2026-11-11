package com.nyumba.ledger.config;

import com.nyumba.ledger.domain.*;
import com.nyumba.ledger.repo.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/** Runs at start-up: makes sure the owner can log in, and (optionally) loads the sample data. */
@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AccountRepository accounts;
    private final HouseRepository houses;
    private final TenantRepository tenants;
    private final InvoiceRepository invoices;
    private final PaymentRepository payments;
    private final RequestRepository requests;
    private final PasswordEncoder encoder;

    @Value("${app.owner.username}") private String ownerUsername;
    @Value("${app.owner.password}") private String ownerPassword;
    @Value("${app.owner.name}") private String ownerName;
    @Value("${app.owner.reset-password:false}") private boolean resetOwnerPassword;
    @Value("${app.seed-demo-data:false}") private boolean seedDemo;

    public DataInitializer(AccountRepository accounts, HouseRepository houses, TenantRepository tenants,
                           InvoiceRepository invoices, PaymentRepository payments, RequestRepository requests,
                           PasswordEncoder encoder) {
        this.accounts = accounts; this.houses = houses; this.tenants = tenants;
        this.invoices = invoices; this.payments = payments; this.requests = requests; this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        var existing = accounts.findByUsername(ownerUsername);
        if (existing.isEmpty()) {
            accounts.save(new UserAccount(ownerUsername, encoder.encode(ownerPassword), UserAccount.OWNER, ownerName));
            log.info("Owner account '{}' was created.", ownerUsername);
        } else if (resetOwnerPassword) {
            UserAccount owner = existing.get();
            owner.setPasswordHash(encoder.encode(ownerPassword));
            owner.setEnabled(true);
            log.warn("Owner account '{}' password was RESET from the settings. Remove app.owner.reset-password now.", ownerUsername);
        } else {
            log.info("Owner account '{}' already exists; its password is NOT changed by the settings.", ownerUsername);
        }
        if (seedDemo && houses.count() == 0) seedDemoData();
    }

    private Tenant tenant(String name, String phone, String email, String idNo, LocalDate moveIn, House house, String username) {
        UserAccount a = accounts.save(new UserAccount(username, encoder.encode("tenant123"), UserAccount.TENANT, name));
        return tenants.save(new Tenant(name, phone, email, idNo, moveIn, house, a));
    }

    private Invoice invoice(Tenant t, String period, long amount, long paid, LocalDate issued, LocalDate due) {
        Invoice i = invoices.save(new Invoice(t, t.getHouse().getNumber(), period, amount, issued, due, null));
        i.setNo("INV-" + (1000 + i.getId()));
        i.setPaid(paid);
        return i;
    }

    private void seedDemoData() {
        houses.save(new House("A-01", "1-bedroom", "Milimani", 14000));
        House a04 = houses.save(new House("A-04", "2-bedroom apartment", "Milimani", 15500));
        houses.save(new House("B-03", "Bedsitter", "Nyalenda", 9500));
        House b12 = houses.save(new House("B-12", "2-bedroom apartment", "Milimani", 18000));
        houses.save(new House("C-02", "3-bedroom maisonette", "Migosi", 24000));
        House c07 = houses.save(new House("C-07", "1-bedroom", "Migosi", 12000));

        Tenant amina = tenant("Amina Otieno", "0712 345 678", "amina@example.com", "31245678", LocalDate.of(2026, 2, 1), b12, "tenant01");
        Tenant james = tenant("James Mwangi", "0722 111 222", "james@example.com", "29874512", LocalDate.of(2026, 3, 1), a04, "tenant02");
        Tenant grace = tenant("Grace Wekesa", "0733 555 901", "grace@example.com", "33019944", LocalDate.of(2026, 1, 1), c07, "tenant03");

        invoice(amina, "October 2026", 18000, 18000, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 5));
        invoice(amina, "November 2026", 18000, 0, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 15));
        invoice(james, "October 2026", 15500, 15500, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 5));
        invoice(james, "November 2026", 15500, 0, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 5));
        invoice(grace, "October 2026", 12000, 0, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 5));
        invoice(grace, "November 2026", 12000, 0, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 5));

        payments.save(new Payment(amina, "B-12", 18000, LocalDate.of(2026, 10, 4), "M-Pesa", "QFA3K81MZ2", Payment.PAID));
        payments.save(new Payment(james, "A-04", 15500, LocalDate.of(2026, 10, 3), "Bank transfer", "BNK-77120", Payment.PAID));

        requests.save(new MaintenanceRequest(amina, "B-12", "Plumbing", "Normal", "Bathroom sink drains slowly.", LocalDate.of(2026, 10, 28), "resolved"));
        requests.save(new MaintenanceRequest(grace, "C-07", "Electrical", "Urgent", "Living room socket sparks when a plug goes in.", LocalDate.of(2026, 11, 7), "pending"));
        requests.save(new MaintenanceRequest(james, "A-04", "Doors and locks", "Normal", "The back door lock is stiff.", LocalDate.of(2026, 11, 5), "in progress"));
    }
}
