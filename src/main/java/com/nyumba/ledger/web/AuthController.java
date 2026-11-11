package com.nyumba.ledger.web;

import com.nyumba.ledger.domain.Tenant;
import com.nyumba.ledger.domain.UserAccount;
import com.nyumba.ledger.dto.Dtos.Me;
import com.nyumba.ledger.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Login and logout themselves are handled by Spring Security (see SecurityConfig). */
@RestController
public class AuthController {
    private final CurrentUserService current;

    public AuthController(CurrentUserService current) { this.current = current; }

    /** Who am I? The pages call this first; 401 means "go to the login page". */
    @GetMapping("/api/auth/me")
    public ResponseEntity<Me> me(Authentication auth) {
        if (auth == null || auth instanceof AnonymousAuthenticationToken) return ResponseEntity.status(401).build();
        UserAccount u = current.account(auth);
        String tenantId = null;
        if (UserAccount.TENANT.equals(u.getRole())) {
            Tenant t = current.tenant(auth);
            tenantId = String.valueOf(t.getId());
        }
        return ResponseEntity.ok(new Me(u.getRole().toLowerCase(), u.getDisplayName(), tenantId));
    }
}
