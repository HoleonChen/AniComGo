package com.anicomgo.common.security;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.ResultCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser authUser)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "请先登录");
        }
        return authUser;
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
