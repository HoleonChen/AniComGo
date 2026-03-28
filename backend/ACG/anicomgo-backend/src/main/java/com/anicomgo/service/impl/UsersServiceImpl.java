package com.anicomgo.service.impl;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.dto.admin.AdminResetPasswordRequest;
import com.anicomgo.dto.auth.UserProfileResponse;
import com.anicomgo.dto.user.ChangePasswordRequest;
import com.anicomgo.dto.user.UpdateProfileRequest;
import com.anicomgo.entity.Users;
import com.anicomgo.mapper.UsersMapper;
import com.anicomgo.service.UsersService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UsersServiceImpl extends ServiceImpl<UsersMapper, Users> implements UsersService {

    private final PasswordEncoder passwordEncoder;

    public UsersServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileResponse getProfile(Long userId) {
        Users user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return toProfile(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        Users user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }

        String username = request.getUsername().trim();
        boolean usernameTaken = exists(new LambdaQueryWrapper<Users>()
                .eq(Users::getUsername, username)
                .ne(Users::getId, userId));
        if (usernameTaken) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用户名已存在");
        }

        user.setUsername(username);
        user.setAvatarUrl(trimToNull(request.getAvatarUrl()));
        user.setBio(trimToNull(request.getBio()));
        if (!updateById(user)) {
            throw new BusinessException(ResultCode.ERROR, "更新个人资料失败");
        }
        return toProfile(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        Users user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "旧密码错误");
        }
        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "新密码不能与旧密码相同");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        if (!updateById(user)) {
            throw new BusinessException(ResultCode.ERROR, "修改密码失败");
        }
    }

    @Override
    @Transactional
    public void updateUserStatus(Long userId, Byte status) {
        Users user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        user.setStatus(status);
        if (!updateById(user)) {
            throw new BusinessException(ResultCode.ERROR, "修改用户状态失败");
        }
    }

    @Override
    @Transactional
    public void updateUserRole(Long userId, Byte role) {
        Users user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        user.setRole(role);
        if (!updateById(user)) {
            throw new BusinessException(ResultCode.ERROR, "修改用户角色失败");
        }
    }

    @Override
    @Transactional
    public void adminResetPassword(Long userId, AdminResetPasswordRequest request) {
        Users user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        if (!updateById(user)) {
            throw new BusinessException(ResultCode.ERROR, "管理员重置密码失败");
        }
    }

    private UserProfileResponse toProfile(Users user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
