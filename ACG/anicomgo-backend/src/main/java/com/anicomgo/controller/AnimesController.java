package com.anicomgo.controller;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.Result;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.dto.anime.AnimeRequest;
import com.anicomgo.entity.Animes;
import com.anicomgo.service.AnimesService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/animes")
@RequiredArgsConstructor
public class AnimesController {

    private final AnimesService animesService;

    @GetMapping
    public Result<IPage<Animes>> list(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码不能小于 1") long page,
            @RequestParam(defaultValue = "5") @Min(value = 1, message = "每页条数不能小于 1") long size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer status
    ) {
        if (status != null && status != 1 && status != 2) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "番剧状态不合法");
        }

        Page<Animes> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<Animes> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.hasText(title), Animes::getTitle, title == null ? null : title.trim());
        queryWrapper.eq(status != null, Animes::getStatus, status);
        queryWrapper.orderByDesc(Animes::getCreatedAt);

        return Result.success(animesService.page(pageRequest, queryWrapper));
    }

    @GetMapping("/{id}")
    public Result<Animes> detail(@PathVariable @Min(value = 1, message = "番剧 ID 不合法") Long id) {
        Animes anime = animesService.getById(id);
        if (anime == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "番剧不存在");
        }
        return Result.success(anime);
    }

    @PostMapping
    public Result<String> save(@Valid @RequestBody AnimeRequest request) {
        animesService.createAnime(request);
        return Result.success("新增番剧成功", null);
    }

    @PutMapping("/{id}")
    public Result<String> update(
            @PathVariable @Min(value = 1, message = "番剧 ID 不合法") Long id,
            @Valid @RequestBody AnimeRequest request
    ) {
        animesService.updateAnime(id, request);
        return Result.success("修改番剧成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable @Min(value = 1, message = "番剧 ID 不合法") Long id) {
        animesService.deleteAnime(id);
        return Result.success("删除番剧成功", null);
    }
}
