package com.nyumba.ledger.config;

import com.nyumba.ledger.domain.UserAccount;
import com.nyumba.ledger.repo.AccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Lets Spring Security check logins against the user_accounts table. */
@Service
public class AccountUserDetailsService implements UserDetailsService {
    private final AccountRepository accounts;

    public AccountUserDetailsService(AccountRepository accounts) { this.accounts = accounts; }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount a = accounts.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No such user"));
        return User.withUsername(a.getUsername())
                .password(a.getPasswordHash())
                .roles(a.getRole())
                .disabled(!a.isEnabled())
                .build();
    }
}
