package com.anicomgo.service.impl;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.common.security.AuthUser;
import com.anicomgo.common.security.JwtService;
import com.anicomgo.dto.auth.AuthResponse;
import com.anicomgo.dto.auth.LoginRequest;
import com.anicomgo.dto.auth.RegisterRequest;
import com.anicomgo.dto.auth.UserProfileResponse;
import com.anicomgo.entity.Users;
import com.anicomgo.service.AuthService;
import com.anicomgo.service.UsersService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AuthServiceImpl implements AuthService {

    private final UsersService usersService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UsersService usersService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usersService = usersService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        boolean exists = usersService.exists(new LambdaQueryWrapper<Users>()
                .eq(Users::getUsername, username));
        if (exists) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用户名已存在");
        }

        Users user = new Users();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        user.setAvatarUrl(trimToNull(request.getAvatarUrl()));
        user.setBio(trimToNull(request.getBio()));
        user.setRole((byte) 0);
        user.setStatus((byte) 1);

        if (!usersService.save(user)) {
            throw new BusinessException(ResultCode.ERROR, "注册失败");
        }

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername().trim();
        Users user = usersService.getOne(new LambdaQueryWrapper<Users>()
                .eq(Users::getUsername, username)
                .last("limit 1"));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "用户名或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ResultCode.FORBIDDEN, "账号已被禁用");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(Users user) {
        AuthUser authUser = new AuthUser(user.getId(), user.getUsername(), user.getRole());
        return AuthResponse.builder()
                .token(jwtService.generateToken(authUser))
                .user(UserProfileResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .avatarUrl(user.getAvatarUrl())
                        .bio(user.getBio())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .build())
                .build();
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
