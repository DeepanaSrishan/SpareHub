package com.sparehub.security;

import com.sparehub.entity.User;
import com.sparehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        User user = userRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User account not found"
                        )
                );

        return org.springframework.security.core.userdetails
                .User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(
                        "ROLE_" + user.getRole().name()
                )
                .disabled(!user.canLogin())
                .build();
    }
}