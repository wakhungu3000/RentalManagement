package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.Invoice;
import com.nyumba.ledger.domain.Payment;
import com.nyumba.ledger.domain.Tenant;
import com.nyumba.ledger.dto.Requests.BulkInvoiceRequest;
import com.nyumba.ledger.dto.Requests.InvoiceRequest;
import com.nyumba.ledger.dto.Requests.PaymentRequest;
import com.nyumba.ledger.repo.InvoiceRepository;
import com.nyumba.ledger.repo.PaymentRepository;
import com.nyumba.ledger.repo.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Money rules live here, on the server, so a browser cannot change them:
 * invoice numbering, who may record a payment, and how a payment is applied.
 */
@Service
@Transactional
public class BillingService {
    private final InvoiceRepository invoices;
    private final PaymentRepository payments;
    private final TenantRepository tenants;
    private final NotificationService notifier;

    public BillingService(InvoiceRepository invoices, PaymentRepository payments, TenantRepository tenants, NotificationService notifier) {
        this.invoices = invoices; this.payments = payments; this.tenants = tenants; this.notifier = notifier;
    }

    /* ---------------- invoices ---------------- */

    public Invoice send(InvoiceRequest r) {
        Tenant t = activeTenant(r.tenantId());
        Invoice inv = create(t, r.period().trim(), r.amount(), r.due(), r.note());
        notifier.invoiceSent(inv);
        return inv;
    }

    /** Invoices every active tenant at their house's rent, skipping anyone who already has one for the period. */
    public int sendToAll(BulkInvoiceRequest r) {
        String period = r.period().trim();
        int made = 0;
        for (Tenant t : tenants.findByActiveTrue()) {
            if (t.getHouse() == null || invoices.existsByTenantAndPeriod(t, period)) continue;
            notifier.invoiceSent(create(t, period, t.getHouse().getRent(), r.due(), null));
            made++;
        }
        return made;
    }

    private Invoice create(Tenant t, String period, long amount, LocalDate due, String note) {
        String houseNo = t.getHouse() == null ? "—" : t.getHouse().getNumber();
        Invoice inv = invoices.save(new Invoice(t, houseNo, period, amount, LocalDate.now(), due, note == null ? null : note.trim()));
        inv.setNo("INV-" + (1000 + inv.getId()));   // unique because the id is unique
        return inv;
    }

    /* ---------------- payments ---------------- */

    /** The owner received money: it counts immediately. */
    public Payment recordByOwner(PaymentRequest r) {
        Tenant t = activeTenant(r.tenantId());
        checkAmount(t, r, "This tenant has no balance due. Send an invoice first.");
        Payment p = payments.save(new Payment(t, houseNumber(t), r.amount(), LocalDate.now(), r.method(), clean(r.ref()), Payment.PAID));
        allocate(t, r.amount());
        return p;
    }

    /** A tenant says they paid: it waits for the owner to confirm, because the server cannot see the money. */
    public Payment reportByTenant(Tenant t, PaymentRequest r) {
        checkAmount(t, r, "You have nothing due right now. Your landlord will send an invoice when rent is due.");
        return payments.save(new Payment(t, houseNumber(t), r.amount(), LocalDate.now(), r.method(), clean(r.ref()), Payment.PENDING));
    }

    public Payment confirm(Long id) {
        Payment p = payments.findById(id).orElseThrow(() -> new BadRequestException("That payment no longer exists."));
        if (!Payment.PENDING.equals(p.getStatus())) throw new BadRequestException("This payment is already confirmed.");
        p.setStatus(Payment.PAID);
        allocate(p.getTenant(), p.getAmount());
        return p;
    }

    public long balance(Tenant t) {
        return invoices.findByTenantOrderByDueAsc(t).stream().mapToLong(Invoice::getBalance).sum();
    }

    /** Applies money to the oldest unpaid invoice first. */
    private void allocate(Tenant t, long amount) {
        long left = amount;
        for (Invoice i : invoices.findByTenantOrderByDueAsc(t)) {
            if (left <= 0) break;
            long open = i.getBalance();
            if (open <= 0) continue;
            long use = Math.min(left, open);
            i.setPaid(i.getPaid() + use);
            left -= use;
        }
    }

    private void checkAmount(Tenant t, PaymentRequest r, String nothingDue) {
        long bal = balance(t);
        if (bal <= 0) throw new BadRequestException(nothingDue);
        if (r.amount() > bal)
            throw new BadRequestException(String.format("The amount is more than the balance of KES %,d. Enter KES %,d or less.", bal, bal));
        if (!"Cash".equals(r.method()) && clean(r.ref()).isEmpty())
            throw new BadRequestException("Enter the transaction reference for this " + r.method() + " payment.");
    }

    private Tenant activeTenant(String tenantId) {
        return tenants.findById(TenantService.parseId(tenantId)).filter(Tenant::isActive)
                .orElseThrow(() -> new BadRequestException("That tenant no longer exists."));
    }

    private static String houseNumber(Tenant t) { return t.getHouse() == null ? "—" : t.getHouse().getNumber(); }
    private static String clean(String s) { return s == null ? "" : s.trim(); }
}
