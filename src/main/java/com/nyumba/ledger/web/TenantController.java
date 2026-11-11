package com.nyumba.ledger.web;

import com.nyumba.ledger.dto.Dtos.Result;
import com.nyumba.ledger.dto.Dtos.TenantDto;
import com.nyumba.ledger.dto.Requests.TenantRequest;
import com.nyumba.ledger.service.Mapper;
import com.nyumba.ledger.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
@PreAuthorize("hasRole('OWNER')")
public class TenantController {
    private final TenantService service;

    public TenantController(TenantService service) { this.service = service; }

    /** Creates the tenant and their login. The response carries the password once. */
    @PostMapping
    public Result<TenantDto> add(@Valid @RequestBody TenantRequest r) {
        TenantService.Created c = service.add(r);
        return Result.of(Mapper.tenant(c.tenant(), c.password()));
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> remove(@PathVariable String id) {
        service.remove(TenantService.parseId(id));
        return Map.of("ok", true);
    }
}
