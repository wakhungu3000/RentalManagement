package com.nyumba.ledger.repo;

import com.nyumba.ledger.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTenant(Tenant tenant);
}
