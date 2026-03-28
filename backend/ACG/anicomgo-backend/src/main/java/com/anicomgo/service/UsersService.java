package com.anicomgo.service;

import com.anicomgo.dto.auth.UserProfileResponse;
import com.anicomgo.dto.admin.AdminResetPasswordRequest;
import com.anicomgo.dto.user.ChangePasswordRequest;
import com.anicomgo.dto.user.UpdateProfileRequest;
import com.anicomgo.entity.Users;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author AniComGo
 * @since 2026-03-20
 */
public interface UsersService extends IService<Users> {

    UserProfileResponse getProfile(Long userId);

    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    void updateUserStatus(Long userId, Byte status);

    void updateUserRole(Long userId, Byte role);

    void adminResetPassword(Long userId, AdminResetPasswordRequest request);
}
