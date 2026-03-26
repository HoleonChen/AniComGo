package com.anicomgo.controller;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.Result;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.common.security.AuthUser;
import com.anicomgo.common.security.SecurityUtils;
import com.anicomgo.dto.comment.CommentCreateRequest;
import com.anicomgo.dto.comment.CommentLikeResponse;
import com.anicomgo.dto.comment.CommentUpdateRequest;
import com.anicomgo.entity.Comments;
import com.anicomgo.service.CommentsService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentsController {

    private final CommentsService commentsService;

    @GetMapping
    public Result<IPage<Comments>> list(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码不能小于 1") long page,
            @RequestParam(defaultValue = "5") @Min(value = 1, message = "每页条数不能小于 1") long size,
            @RequestParam(required = false) @Min(value = 1, message = "番剧 ID 不合法") Long animeId,
            @RequestParam(required = false) @Min(value = 1, message = "用户 ID 不合法") Long userId,
            @RequestParam(required = false) Byte status
    ) {
        if (status != null && status != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "这里只允许查询可见评论");
        }

        Page<Comments> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<Comments> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(animeId != null, Comments::getAnimeId, animeId);
        queryWrapper.eq(userId != null, Comments::getUserId, userId);
        queryWrapper.eq(Comments::getStatus, (byte) 1);
        queryWrapper.orderByDesc(Comments::getCreatedAt);

        return Result.success(commentsService.page(pageRequest, queryWrapper));
    }

    @GetMapping("/{id}")
    public Result<Comments> detail(@PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id) {
        Comments comment = commentsService.getById(id);
        if (comment == null || comment.getStatus() == null || comment.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在");
        }
        return Result.success(comment);
    }

    @GetMapping("/{id}/like-status")
    public Result<CommentLikeResponse> likeStatus(@PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id) {
        return Result.success(commentsService.getCommentLikeStatus(SecurityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    public Result<String> save(@Valid @RequestBody CommentCreateRequest request) {
        commentsService.createComment(SecurityUtils.getCurrentUserId(), request);
        return Result.success("发表评论成功", null);
    }

    @PatchMapping("/{id}/like")
    public Result<CommentLikeResponse> like(@PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id) {
        return Result.success("评论点赞成功", commentsService.likeComment(SecurityUtils.getCurrentUserId(), id));
    }

    @DeleteMapping("/{id}/like")
    public Result<CommentLikeResponse> unlike(@PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id) {
        return Result.success("取消评论点赞成功", commentsService.unlikeComment(SecurityUtils.getCurrentUserId(), id));
    }

    @PutMapping("/{id}")
    public Result<String> update(
            @PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id,
            @Valid @RequestBody CommentUpdateRequest request
    ) {
        AuthUser currentUser = SecurityUtils.getCurrentUser();
        commentsService.updateComment(currentUser.getId(), currentUser.isAdmin(), id, request);
        return Result.success("修改评论成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable @Min(value = 1, message = "评论 ID 不合法") Long id) {
        AuthUser currentUser = SecurityUtils.getCurrentUser();
        commentsService.deleteComment(currentUser.getId(), currentUser.isAdmin(), id);
        return Result.success("删除评论成功", null);
    }
}
