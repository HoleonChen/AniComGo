package com.anicomgo.controller;

import com.anicomgo.common.result.Result;
import com.anicomgo.common.security.AuthUser;
import com.anicomgo.common.security.SecurityUtils;
import com.anicomgo.dto.collection.CollectionCreateRequest;
import com.anicomgo.dto.collection.UpdateCollectionProgressRequest;
import com.anicomgo.entity.Collections;
import com.anicomgo.service.CollectionsService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/collections")
@RequiredArgsConstructor
public class CollectionsController {

    private final CollectionsService collectionsService;

    @GetMapping
    public Result<Page<Collections>> list(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码不能小于 1") long page,
            @RequestParam(defaultValue = "5") @Min(value = 1, message = "每页条数不能小于 1") long size,
            @RequestParam(required = false) @Min(value = 1, message = "用户 ID 不合法") Long userId
    ) {
        Page<Collections> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<Collections> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(userId != null, Collections::getUserId, userId);
        queryWrapper.orderByDesc(Collections::getCreatedAt);

        return Result.success(collectionsService.page(pageRequest, queryWrapper));
    }

    @PostMapping
    public Result<String> save(@Valid @RequestBody CollectionCreateRequest request) {
        collectionsService.createCollection(SecurityUtils.getCurrentUserId(), request);
        return Result.success("新增收藏成功", null);
    }

    @GetMapping("/anime/{animeId}")
    public Result<Collections> detailByAnimeId(@PathVariable @Min(value = 1, message = "番剧 ID 不合法") Long animeId) {
        return Result.success(collectionsService.getCurrentUserCollectionByAnimeId(SecurityUtils.getCurrentUserId(), animeId));
    }

    @PatchMapping("/anime/{animeId}/progress")
    public Result<Collections> updateProgress(
            @PathVariable @Min(value = 1, message = "番剧 ID 不合法") Long animeId,
            @Valid @RequestBody UpdateCollectionProgressRequest request
    ) {
        Collections collection = collectionsService.updateCollectionProgress(
                SecurityUtils.getCurrentUserId(),
                animeId,
                request
        );
        return Result.success("修改追番进度成功", collection);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable @Min(value = 1, message = "收藏 ID 不合法") Long id) {
        AuthUser currentUser = SecurityUtils.getCurrentUser();
        collectionsService.deleteCollection(currentUser.getId(), currentUser.isAdmin(), id);
        return Result.success("删除收藏成功", null);
    }
}
