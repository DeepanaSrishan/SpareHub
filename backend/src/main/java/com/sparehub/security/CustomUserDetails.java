package com.sparehub.security;

import com.sparehub.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private Long id;
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean active;

    public static CustomUserDetails create(User user) {
        Collection<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                .collect(Collectors.toList());

        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                authorities,
                user.getActive()
        );
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
