package com.nyumba.ledger.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyumba.ledger.domain.UserAccount;
import com.nyumba.ledger.repo.AccountRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.util.Map;

@Configuration
@EnableMethodSecurity          // enables @PreAuthorize("hasRole('OWNER')") on the controllers
public class SecurityConfig {
    private final ObjectMapper json = new ObjectMapper();

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AccountRepository accounts) throws Exception {
        http
            // Browser pages send the CSRF cookie's value back in the X-XSRF-TOKEN header (see js/api.js).
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()      // login, logout, "who am I"
                .requestMatchers("/api/**").authenticated()       // all data needs a login (roles checked per endpoint)
                .anyRequest().permitAll())                         // the HTML/CSS/JS files hold no data

            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler((req, res, authentication) -> {
                    UserAccount u = accounts.findByUsername(authentication.getName()).orElseThrow();
                    res.setStatus(200);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    json.writeValue(res.getWriter(), Map.of("role", u.getRole().toLowerCase(), "name", u.getDisplayName()));
                })
                .failureHandler((req, res, ex) -> {
                    res.setStatus(401);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    json.writeValue(res.getWriter(), Map.of("error", "Incorrect username or password. Please try again."));
                }))

            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req, res, authentication) -> res.setStatus(200)))

            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

        return http.build();
    }
}
