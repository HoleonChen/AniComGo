package com.anicomgo.service.impl;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.dto.collection.CollectionCreateRequest;
import com.anicomgo.dto.collection.UpdateCollectionProgressRequest;
import com.anicomgo.entity.Animes;
import com.anicomgo.entity.Collections;
import com.anicomgo.mapper.CollectionsMapper;
import com.anicomgo.service.AnimesService;
import com.anicomgo.service.CollectionsService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollectionsServiceImpl extends ServiceImpl<CollectionsMapper, Collections> implements CollectionsService {

    private final AnimesService animesService;

    public CollectionsServiceImpl(AnimesService animesService) {
        this.animesService = animesService;
    }

    @Override
    @Transactional
    public void createCollection(Long currentUserId, CollectionCreateRequest request) {
        Animes anime = animesService.getById(request.getAnimeId());
        if (anime == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "番剧不存在");
        }
        if (hasCollected(currentUserId, request.getAnimeId())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "收藏记录已存在");
        }
        if (request.getProgress() != null
                && anime.getTotalEpisodes() != null
                && request.getProgress() > anime.getTotalEpisodes()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "观看进度不能超过总集数");
        }

        Collections collection = new Collections();
        collection.setUserId(currentUserId);
        collection.setAnimeId(request.getAnimeId());
        collection.setProgress(request.getProgress() == null ? 0 : request.getProgress());
        collection.setRating(request.getRating());

        if (!save(collection)) {
            throw new BusinessException(ResultCode.ERROR, "新增收藏失败");
        }
    }

    @Override
    public Collections getCurrentUserCollectionByAnimeId(Long currentUserId, Long animeId) {
        Animes anime = animesService.getById(animeId);
        if (anime == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "番剧不存在");
        }

        Collections collection = getOne(new LambdaQueryWrapper<Collections>()
                .eq(Collections::getUserId, currentUserId)
                .eq(Collections::getAnimeId, animeId));
        if (collection == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "收藏不存在");
        }
        return collection;
    }

    @Override
    @Transactional
    public Collections updateCollectionProgress(Long currentUserId, Long animeId, UpdateCollectionProgressRequest request) {
        Animes anime = animesService.getById(animeId);
        if (anime == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "番剧不存在");
        }
        if (anime.getTotalEpisodes() != null && request.getProgress() > anime.getTotalEpisodes()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "观看进度不能超过总集数");
        }

        Collections collection = getOne(new LambdaQueryWrapper<Collections>()
                .eq(Collections::getUserId, currentUserId)
                .eq(Collections::getAnimeId, animeId));
        if (collection == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "收藏不存在");
        }

        collection.setProgress(request.getProgress());
        if (!updateById(collection)) {
            throw new BusinessException(ResultCode.ERROR, "修改追番进度失败");
        }
        return collection;
    }

    @Override
    @Transactional
    public void deleteCollection(Long currentUserId, boolean admin, Long collectionId) {
        Collections collection = getById(collectionId);
        if (collection == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "收藏不存在");
        }
        if (!admin && !currentUserId.equals(collection.getUserId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "你只能操作自己的收藏");
        }
        if (!removeById(collectionId)) {
            throw new BusinessException(ResultCode.ERROR, "删除收藏失败");
        }
    }

    @Override
    @Transactional
    public void adminDeleteCollection(Long collectionId) {
        Collections collection = getById(collectionId);
        if (collection == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "收藏不存在");
        }
        if (!removeById(collectionId)) {
            throw new BusinessException(ResultCode.ERROR, "删除收藏失败");
        }
    }

    @Override
    @Transactional
    public void batchAdminDeleteCollections(List<Long> ids) {
        List<Collections> collections = listByIds(ids);
        if (collections.size() != ids.size()) {
            throw new BusinessException(ResultCode.NOT_FOUND, "部分收藏不存在");
        }
        if (!removeByIds(ids)) {
            throw new BusinessException(ResultCode.ERROR, "批量删除收藏失败");
        }
    }

    @Override
    public boolean hasCollected(Long userId, Long animeId) {
        return exists(new LambdaQueryWrapper<Collections>()
                .eq(Collections::getUserId, userId)
                .eq(Collections::getAnimeId, animeId));
    }
}
