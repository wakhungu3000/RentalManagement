package com.nyumba.ledger.repo;

import com.nyumba.ledger.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByTenant(Tenant tenant);
}
