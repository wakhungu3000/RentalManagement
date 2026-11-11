package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.MaintenanceRequest;
import com.nyumba.ledger.domain.Tenant;
import com.nyumba.ledger.dto.Requests.MaintenanceCreate;
import com.nyumba.ledger.repo.RequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class MaintenanceService {
    private final RequestRepository requests;

    public MaintenanceService(RequestRepository requests) { this.requests = requests; }

    public MaintenanceRequest create(Tenant t, MaintenanceCreate r) {
        String house = t.getHouse() == null ? "—" : t.getHouse().getNumber();
        return requests.save(new MaintenanceRequest(t, house, r.category(), r.priority(), r.desc().trim(), LocalDate.now(), "pending"));
    }

    public MaintenanceRequest setStatus(Long id, String status) {
        MaintenanceRequest r = requests.findById(id).orElseThrow(() -> new BadRequestException("That request no longer exists."));
        r.setStatus(status);
        return r;
    }
}
