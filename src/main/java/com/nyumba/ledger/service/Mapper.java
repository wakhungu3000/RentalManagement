package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.*;
import com.nyumba.ledger.dto.Dtos.*;

/** Turns database entities into the shapes the browser receives. */
public final class Mapper {
    private Mapper() {}

    private static String id(Long v) { return v == null ? null : String.valueOf(v); }

    public static HouseDto house(House h, Tenant occupant) {
        return new HouseDto(id(h.getId()), h.getNumber(), h.getType(), h.getLocation(), h.getRent(),
                occupant == null ? "available" : "occupied", occupant == null ? null : id(occupant.getId()));
    }

    public static TenantDto tenant(Tenant t) { return tenant(t, null); }

    /** password is filled only once, right after the owner adds the tenant. */
    public static TenantDto tenant(Tenant t, String plainPassword) {
        return new TenantDto(id(t.getId()), t.getName(), t.getPhone(), t.getEmail(), t.getIdNo(),
                t.getHouse() == null ? null : id(t.getHouse().getId()), t.getMoveIn(),
                t.getAccount().getUsername(), plainPassword);
    }

    public static InvoiceDto invoice(Invoice i) {
        return new InvoiceDto(id(i.getId()), i.getNo(), id(i.getTenant().getId()), i.getTenantName(), i.getHouseNumber(),
                i.getPeriod(), i.getAmount(), i.getPaid(), i.getIssued(), i.getDue(), i.getNote() == null ? "" : i.getNote());
    }

    public static PaymentDto payment(Payment p) {
        return new PaymentDto(id(p.getId()), id(p.getTenant().getId()), p.getTenantName(), p.getHouseNumber(),
                p.getAmount(), p.getDate(), p.getMethod(), p.getRef() == null ? "" : p.getRef(), p.getStatus());
    }

    public static RequestDto request(MaintenanceRequest r) {
        return new RequestDto(id(r.getId()), id(r.getTenant().getId()), r.getTenantName(), r.getHouseNumber(),
                r.getCategory(), r.getPriority(), r.getDescription(), r.getDate(), r.getStatus());
    }
}
