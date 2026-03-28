package com.anicomgo.controller;

import com.anicomgo.common.result.Result;
import com.anicomgo.common.security.SecurityUtils;
import com.anicomgo.dto.auth.AuthResponse;
import com.anicomgo.dto.auth.LoginRequest;
import com.anicomgo.dto.auth.RegisterRequest;
import com.anicomgo.dto.auth.UserProfileResponse;
import com.anicomgo.service.AuthService;
import com.anicomgo.service.UsersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UsersService usersService;

    @PostMapping("/register")
    public Result<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return Result.success("注册成功", authService.register(request));
    }

    @PostMapping("/login")
    public Result<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success("登录成功", authService.login(request));
    }

    @GetMapping("/me")
    public Result<UserProfileResponse> currentUser() {
        return Result.success(usersService.getProfile(SecurityUtils.getCurrentUserId()));
    }
}
