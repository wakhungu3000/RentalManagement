package com.nyumba.ledger.web;

import com.nyumba.ledger.dto.Dtos.HouseDto;
import com.nyumba.ledger.dto.Dtos.Result;
import com.nyumba.ledger.dto.Requests.HouseRequest;
import com.nyumba.ledger.service.HouseService;
import com.nyumba.ledger.service.Mapper;
import com.nyumba.ledger.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/houses")
@PreAuthorize("hasRole('OWNER')")
public class HouseController {
    private final HouseService service;

    public HouseController(HouseService service) { this.service = service; }

    @PostMapping
    public Result<HouseDto> add(@Valid @RequestBody HouseRequest r) {
        return Result.of(Mapper.house(service.add(r), null));
    }

    @PutMapping("/{id}")
    public Result<HouseDto> update(@PathVariable String id, @Valid @RequestBody HouseRequest r) {
        return Result.of(Mapper.house(service.update(TenantService.parseId(id), r), null));
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> delete(@PathVariable String id) {
        service.delete(TenantService.parseId(id));
        return Map.of("ok", true);
    }
}
