package com.anicomgo.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {

    private Long id;
    private String username;
    private String avatarUrl;
    private String bio;
    private Byte role;
    private Byte status;
}
