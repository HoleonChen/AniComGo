package com.anicomgo.controller;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.Result;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.dto.admin.AdminResetPasswordRequest;
import com.anicomgo.dto.admin.BatchDeleteCollectionsRequest;
import com.anicomgo.dto.admin.BatchUpdateCommentStatusRequest;
import com.anicomgo.dto.admin.UpdateCommentStatusRequest;
import com.anicomgo.dto.admin.UpdateUserRoleRequest;
import com.anicomgo.dto.admin.UpdateUserStatusRequest;
import com.anicomgo.dto.auth.UserProfileResponse;
import com.anicomgo.entity.Collections;
import com.anicomgo.entity.Comments;
import com.anicomgo.entity.Users;
import com.anicomgo.service.CollectionsService;
import com.anicomgo.service.CommentsService;
import com.anicomgo.service.UsersService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CommentsService commentsService;
    private final CollectionsService collectionsService;
    private final UsersService usersService;

    @GetMapping("/users")
    public Result<IPage<Users>> users(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码不能小于 1") long page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数不能小于 1") long size,
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

    @GetMapping("/users/{id}")
    public Result<UserProfileResponse> userDetail(@PathVariable @Min(value = 1, message = "用户 ID 不合法") Long id) {
        return Result.success(usersService.getProfile(id));
    }

    @GetMapping("/comments")
    public Result<IPage<Comments>> comments(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码不能小于 1") long page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数不能小于 1") long size,
            @RequestParam(required = false) @Min(value = 1, message = "番剧 ID 不合法") Long animeId,
            @RequestParam(required = false) @Min(value = 1, message = "用户 ID 不合法") Long userId,
            @RequestParam(required = false) Byte status,
            @RequestParam(required = false) String keyword
    ) {
        if (status != null && status != 0 && status != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "评论状态不合法");
        }

        Page<Comments> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<Comments> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(animeId != null, Comments::getAnimeId, animeId);
        queryWrapper.eq(userId != null, Comments::getUserId, userId);
        queryWrapper.eq(status != null, Comments::getStatus, status);
        queryWrapper.like(StringUtils.hasText(keyword), Comments::getContent, keyword == null ? null : keyword.trim());
        queryWrapper.orderByDesc(Comments::getCreatedAt);

        return Result.success(commentsService.page(pageRequest, queryWrapper));
    }

    @GetMapping("/collections")
    public Result<IPage<Collections>> collections(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码不能小于 1") long page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页条数不能小于 1") long size,
            @RequestParam(required = false) @Min(value = 1, message = "用户 ID 不合法") Long userId,
            @RequestParam(required = false) @Min(value = 1, message = "番剧 ID 不合法") Long animeId,
            @RequestParam(required = false) @Min(value = 1, message = "最低评分不合法") Integer minRating,
            @RequestParam(required = false) @Min(value = 1, message = "最高评分不合法") @Max(value = 5, message = "最高评分不能大于 5") Integer maxRating
    ) {
        if (minRating != null && minRating > 5) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "最低评分不能大于 5");
        }
        if (minRating != null && maxRating != null && minRating > maxRating) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "最低评分不能大于最高评分");
        }

        Page<Collections> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<Collections> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(userId != null, Collections::getUserId, userId);
        queryWrapper.eq(animeId != null, Collections::getAnimeId, animeId);
        queryWrapper.ge(minRating != null, Collections::getRating, minRating);
        queryWrapper.le(maxRating != null, Collections::getRating, maxRating);
        queryWrapper.orderByDesc(Collections::getCreatedAt);

        return Result.success(collectionsService.page(pageRequest, queryWrapper));
    }

    @PatchMapping("/users/{id}/status")
    public Result<String> updateUserStatus(
            @PathVariable @Min(value = 1, message = "用户 ID 不合法") Long id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        usersService.updateUserStatus(id, request.getStatus());
        return Result.success("修改用户状态成功", null);
    }

    @PatchMapping("/users/{id}/role")
    public Result<String> updateUserRole(
            @PathVariable @Min(value = 1, message = "用户 ID 不合法") Long id,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        usersService.updateUserRole(id, request.getRole());
        return Result.success("修改用户角色成功", null);
    }

    @PatchMapping("/users/{id}/password/reset")
    public Result<String> resetUserPassword(
            @PathVariable @Min(value = 1, message = "用户 ID 不合法") Long id,
            @Valid @RequestBody AdminResetPasswordRequest request
    ) {
        usersService.adminResetPassword(id, request);
        return Result.success("管理员重置密码成功", null);
    }

    @PatchMapping("/comments/{id}/status")
    public Result<String> updateCommentStatus(
            @PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id,
            @Valid @RequestBody UpdateCommentStatusRequest request
    ) {
        commentsService.updateCommentStatus(id, request.getStatus());
        return Result.success("修改评论状态成功", null);
    }

    @PatchMapping("/comments/status/batch")
    public Result<String> batchUpdateCommentStatus(@Valid @RequestBody BatchUpdateCommentStatusRequest request) {
        commentsService.batchUpdateCommentStatus(request.getIds(), request.getStatus());
        return Result.success("批量修改评论状态成功", null);
    }

    @DeleteMapping("/comments/{id}")
    public Result<String> deleteComment(@PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id) {
        commentsService.adminDeleteComment(id);
        return Result.success("管理员删除评论成功", null);
    }

    @DeleteMapping("/collections/{id}")
    public Result<String> deleteCollection(@PathVariable @Min(value = 1, message = "收藏 ID 不合法") Long id) {
        collectionsService.adminDeleteCollection(id);
        return Result.success("管理员删除收藏成功", null);
    }

    @DeleteMapping("/collections/batch")
    public Result<String> batchDeleteCollections(@Valid @RequestBody BatchDeleteCollectionsRequest request) {
        collectionsService.batchAdminDeleteCollections(request.getIds());
        return Result.success("批量删除收藏成功", null);
    }
}
