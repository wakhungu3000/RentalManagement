package com.nyumba.ledger.web;

import com.nyumba.ledger.dto.Dtos.RequestDto;
import com.nyumba.ledger.dto.Dtos.Result;
import com.nyumba.ledger.dto.Requests.MaintenanceCreate;
import com.nyumba.ledger.dto.Requests.StatusRequest;
import com.nyumba.ledger.service.CurrentUserService;
import com.nyumba.ledger.service.MaintenanceService;
import com.nyumba.ledger.service.Mapper;
import com.nyumba.ledger.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class MaintenanceController {
    private final MaintenanceService service;
    private final CurrentUserService current;

    public MaintenanceController(MaintenanceService service, CurrentUserService current) {
        this.service = service; this.current = current;
    }

    @PostMapping("/api/requests")
    @PreAuthorize("hasRole('TENANT')")
    public Result<RequestDto> create(@Valid @RequestBody MaintenanceCreate r, Authentication auth) {
        return Result.of(Mapper.request(service.create(current.tenant(auth), r)));
    }

    @PatchMapping("/api/requests/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public Result<RequestDto> setStatus(@PathVariable String id, @Valid @RequestBody StatusRequest r) {
        return Result.of(Mapper.request(service.setStatus(TenantService.parseId(id), r.status())));
    }
}
