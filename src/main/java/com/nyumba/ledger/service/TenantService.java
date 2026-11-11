package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.House;
import com.nyumba.ledger.domain.Tenant;
import com.nyumba.ledger.domain.UserAccount;
import com.nyumba.ledger.dto.Requests.TenantRequest;
import com.nyumba.ledger.repo.AccountRepository;
import com.nyumba.ledger.repo.HouseRepository;
import com.nyumba.ledger.repo.TenantRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
@Transactional
public class TenantService {
    private static final String PASSWORD_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();

    private final TenantRepository tenants;
    private final HouseRepository houses;
    private final AccountRepository accounts;
    private final PasswordEncoder encoder;

    public TenantService(TenantRepository tenants, HouseRepository houses, AccountRepository accounts, PasswordEncoder encoder) {
        this.tenants = tenants; this.houses = houses; this.accounts = accounts; this.encoder = encoder;
    }

    /** The plain password exists only here, once, so the owner can hand it over. */
    public record Created(Tenant tenant, String password) {}

    public Created add(TenantRequest r) {
        House house = houses.findById(parseId(r.houseId()))
                .orElseThrow(() -> new BadRequestException("That house no longer exists."));
        if (tenants.findByHouseAndActiveTrue(house).isPresent())
            throw new BadRequestException("That house is no longer available. Pick another one.");

        String name = r.name().trim();
        String password = randomPassword();
        UserAccount account = accounts.save(new UserAccount(uniqueUsername(name), encoder.encode(password), UserAccount.TENANT, name));
        Tenant tenant = tenants.save(new Tenant(name, r.phone().trim(), blankToNull(r.email()), blankToNull(r.idNo()), r.moveIn(), house, account));
        return new Created(tenant, password);
    }

    /** Frees the house and switches the login off. Invoices and payments are kept. */
    public void remove(Long id) {
        Tenant t = tenants.findById(id).filter(Tenant::isActive)
                .orElseThrow(() -> new BadRequestException("That tenant no longer exists."));
        t.setHouse(null);
        t.setActive(false);
        t.getAccount().setEnabled(false);
    }

    public static Long parseId(String value) {
        try { return Long.valueOf(value); }
        catch (NumberFormatException | NullPointerException e) { throw new BadRequestException("That item could not be found."); }
    }

    private static String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }

    private String uniqueUsername(String fullName) {
        String base = fullName.split("\\s+")[0].toLowerCase().replaceAll("[^a-z]", "");
        if (base.isEmpty()) base = "tenant";
        String username;
        do { username = base + (10 + random.nextInt(90)); } while (accounts.existsByUsername(username));
        return username;
    }

    private String randomPassword() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        return sb.toString();
    }
}
