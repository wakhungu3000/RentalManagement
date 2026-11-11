package com.nyumba.ledger.repo;

import com.nyumba.ledger.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByTenantOrderByDueAsc(Tenant tenant);
    boolean existsByTenantAndPeriod(Tenant tenant, String period);
}
