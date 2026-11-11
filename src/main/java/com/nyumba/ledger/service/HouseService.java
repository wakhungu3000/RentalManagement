package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.House;
import com.nyumba.ledger.dto.Requests.HouseRequest;
import com.nyumba.ledger.repo.HouseRepository;
import com.nyumba.ledger.repo.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HouseService {
    private final HouseRepository houses;
    private final TenantRepository tenants;

    public HouseService(HouseRepository houses, TenantRepository tenants) {
        this.houses = houses; this.tenants = tenants;
    }

    public House get(Long id) {
        return houses.findById(id).orElseThrow(() -> new BadRequestException("That house no longer exists."));
    }

    public House add(HouseRequest r) {
        String number = r.number().trim();
        if (houses.findByNumberIgnoreCase(number).isPresent())
            throw new BadRequestException("House " + number + " already exists. Use a different house number.");
        return houses.save(new House(number, r.type(), r.location().trim(), r.rent()));
    }

    public House update(Long id, HouseRequest r) {
        House h = get(id);
        String number = r.number().trim();
        houses.findByNumberIgnoreCase(number).filter(other -> !other.getId().equals(id)).ifPresent(other -> {
            throw new BadRequestException("House " + number + " already exists. Use a different house number.");
        });
        h.setNumber(number); h.setType(r.type()); h.setLocation(r.location().trim()); h.setRent(r.rent());
        return h;
    }

    public void delete(Long id) {
        House h = get(id);
        if (tenants.findByHouseAndActiveTrue(h).isPresent())
            throw new BadRequestException("House " + h.getNumber() + " has a tenant. Remove the tenant first.");
        houses.delete(h);
    }
}
