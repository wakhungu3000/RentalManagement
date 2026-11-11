package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.*;
import com.nyumba.ledger.dto.Dtos.*;
import com.nyumba.ledger.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Everything a signed-in person is allowed to see, in one read.
 * This is where "a tenant sees only their own data" is enforced.
 */
@Service
@Transactional(readOnly = true)
public class SnapshotService {
    private final HouseRepository houses;
    private final TenantRepository tenants;
    private final InvoiceRepository invoices;
    private final PaymentRepository payments;
    private final RequestRepository requests;

    public SnapshotService(HouseRepository houses, TenantRepository tenants, InvoiceRepository invoices,
                           PaymentRepository payments, RequestRepository requests) {
        this.houses = houses; this.tenants = tenants; this.invoices = invoices; this.payments = payments; this.requests = requests;
    }

    public Snapshot forOwner() {
        List<Tenant> active = tenants.findByActiveTrue();
        Map<Long, Tenant> byHouse = new HashMap<>();
        active.forEach(t -> { if (t.getHouse() != null) byHouse.put(t.getHouse().getId(), t); });

        return new Snapshot(
                houses.findAll().stream().map(h -> Mapper.house(h, byHouse.get(h.getId()))).collect(Collectors.toList()),
                active.stream().map(Mapper::tenant).collect(Collectors.toList()),
                invoices.findAll().stream().map(Mapper::invoice).collect(Collectors.toList()),
                payments.findAll().stream().map(Mapper::payment).collect(Collectors.toList()),
                requests.findAll().stream().map(Mapper::request).collect(Collectors.toList()));
    }

    public Snapshot forTenant(Tenant t) {
        List<HouseDto> ownHouse = t.getHouse() == null ? List.of() : List.of(Mapper.house(t.getHouse(), t));
        return new Snapshot(
                ownHouse,
                List.of(Mapper.tenant(t)),
                invoices.findByTenantOrderByDueAsc(t).stream().map(Mapper::invoice).collect(Collectors.toList()),
                payments.findByTenant(t).stream().map(Mapper::payment).collect(Collectors.toList()),
                requests.findByTenant(t).stream().map(Mapper::request).collect(Collectors.toList()));
    }
}
