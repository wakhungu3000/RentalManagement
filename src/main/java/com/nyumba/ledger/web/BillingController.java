package com.nyumba.ledger.web;

import com.nyumba.ledger.domain.Payment;
import com.nyumba.ledger.domain.UserAccount;
import com.nyumba.ledger.dto.Dtos.InvoiceDto;
import com.nyumba.ledger.dto.Dtos.PaymentDto;
import com.nyumba.ledger.dto.Dtos.Result;
import com.nyumba.ledger.dto.Requests.BulkInvoiceRequest;
import com.nyumba.ledger.dto.Requests.InvoiceRequest;
import com.nyumba.ledger.dto.Requests.PaymentRequest;
import com.nyumba.ledger.service.BillingService;
import com.nyumba.ledger.service.CurrentUserService;
import com.nyumba.ledger.service.Mapper;
import com.nyumba.ledger.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class BillingController {
    private final BillingService billing;
    private final CurrentUserService current;

    public BillingController(BillingService billing, CurrentUserService current) {
        this.billing = billing; this.current = current;
    }

    @PostMapping("/api/invoices")
    @PreAuthorize("hasRole('OWNER')")
    public Result<InvoiceDto> sendInvoice(@Valid @RequestBody InvoiceRequest r) {
        return Result.of(Mapper.invoice(billing.send(r)));
    }

    @PostMapping("/api/invoices/bulk")
    @PreAuthorize("hasRole('OWNER')")
    public Map<String, Integer> invoiceAll(@Valid @RequestBody BulkInvoiceRequest r) {
        return Map.of("made", billing.sendToAll(r));
    }

    /** Owner: records money received (counts at once). Tenant: reports a payment (waits for confirmation). */
    @PostMapping("/api/payments")
    public Result<PaymentDto> pay(@Valid @RequestBody PaymentRequest r, Authentication auth) {
        UserAccount u = current.account(auth);
        Payment p = UserAccount.OWNER.equals(u.getRole())
                ? billing.recordByOwner(r)
                : billing.reportByTenant(current.tenant(auth), r);
        return Result.of(Mapper.payment(p));
    }

    @PostMapping("/api/payments/{id}/confirm")
    @PreAuthorize("hasRole('OWNER')")
    public Result<PaymentDto> confirm(@PathVariable String id) {
        return Result.of(Mapper.payment(billing.confirm(TenantService.parseId(id))));
    }
}
