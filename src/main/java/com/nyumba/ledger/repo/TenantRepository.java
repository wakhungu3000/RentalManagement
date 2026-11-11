package com.nyumba.ledger.repo;

import com.nyumba.ledger.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
    List<Tenant> findByActiveTrue();
    Optional<Tenant> findByAccount(UserAccount account);
    Optional<Tenant> findByHouseAndActiveTrue(House house);
}
