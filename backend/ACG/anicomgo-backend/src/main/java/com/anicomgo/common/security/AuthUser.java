package com.anicomgo.common.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthUser {

    private final Long id;
    private final String username;
    private final Byte role;

    public boolean isAdmin() {
        return role != null && role == 1;
    }
}
