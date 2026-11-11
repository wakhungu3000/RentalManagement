package com.nyumba.ledger.web;

import com.nyumba.ledger.domain.UserAccount;
import com.nyumba.ledger.dto.Dtos.Snapshot;
import com.nyumba.ledger.service.CurrentUserService;
import com.nyumba.ledger.service.SnapshotService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SnapshotController {
    private final SnapshotService snapshots;
    private final CurrentUserService current;

    public SnapshotController(SnapshotService snapshots, CurrentUserService current) {
        this.snapshots = snapshots; this.current = current;
    }

    /** All the data the signed-in person may see: everything for the owner, only their own for a tenant. */
    @GetMapping("/api/snapshot")
    public Snapshot snapshot(Authentication auth) {
        UserAccount u = current.account(auth);
        return UserAccount.OWNER.equals(u.getRole()) ? snapshots.forOwner() : snapshots.forTenant(current.tenant(auth));
    }
}
