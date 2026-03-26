package com.anicomgo.controller;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.Result;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.common.security.SecurityUtils;
import com.anicomgo.dto.auth.UserProfileResponse;
import com.anicomgo.dto.user.AvatarUploadResponse;
import com.anicomgo.dto.user.ChangePasswordRequest;
import com.anicomgo.dto.user.UpdateProfileRequest;
import com.anicomgo.entity.Users;
import com.anicomgo.service.AvatarStorageService;
import com.anicomgo.service.UsersService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UsersController {

    private final UsersService usersService;
    private final AvatarStorageService avatarStorageService;

    @GetMapping
    public Result<IPage<Users>> list(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码不能小于 1") long page,
            @RequestParam(defaultValue = "5") @Min(value = 1, message = "每页条数不能小于 1") long size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Byte role,
            @RequestParam(required = false) Byte status
    ) {
        if (role != null && role != 0 && role != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用户角色不合法");
        }
        if (status != null && status != 0 && status != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用户状态不合法");
        }

        Page<Users> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<Users> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.hasText(username), Users::getUsername, username == null ? null : username.trim());
        queryWrapper.eq(role != null, Users::getRole, role);
        queryWrapper.eq(status != null, Users::getStatus, status);
        queryWrapper.orderByDesc(Users::getCreatedAt);

        return Result.success(usersService.page(pageRequest, queryWrapper));
    }

    @GetMapping("/{id}")
    public Result<Users> detail(@PathVariable @Min(value = 1, message = "用户 ID 不合法") Long id) {
        Users user = usersService.getById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return Result.success(user);
    }

    @PutMapping("/me")
    public Result<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return Result.success("更新个人资料成功", usersService.updateProfile(SecurityUtils.getCurrentUserId(), request));
    }

    @PatchMapping("/me/password")
    public Result<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        usersService.changePassword(SecurityUtils.getCurrentUserId(), request);
        return Result.success("修改密码成功", null);
    }

    @PostMapping("/me/avatar")
    public Result<AvatarUploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        AvatarUploadResponse response = avatarStorageService.storeAvatar(SecurityUtils.getCurrentUserId(), file);
        return Result.success("头像上传成功", response);
    }
}
