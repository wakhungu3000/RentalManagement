package com.nyumba.ledger.service;

import com.nyumba.ledger.domain.Tenant;
import com.nyumba.ledger.domain.UserAccount;
import com.nyumba.ledger.repo.AccountRepository;
import com.nyumba.ledger.repo.TenantRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/** Finds who is making the request. The browser is never asked who it is. */
@Service
public class CurrentUserService {
    private final AccountRepository accounts;
    private final TenantRepository tenants;

    public CurrentUserService(AccountRepository accounts, TenantRepository tenants) {
        this.accounts = accounts; this.tenants = tenants;
    }

    public UserAccount account(Authentication auth) {
        if (auth == null) throw new AccessDeniedException("Not signed in");
        return accounts.findByUsername(auth.getName()).orElseThrow(() -> new AccessDeniedException("Not signed in"));
    }

    /** The tenant record of the signed-in tenant; refused if they have been removed. */
    public Tenant tenant(Authentication auth) {
        Tenant t = tenants.findByAccount(account(auth)).orElseThrow(() -> new AccessDeniedException("Not a tenant"));
        if (!t.isActive()) throw new AccessDeniedException("Tenant removed");
        return t;
    }
}
