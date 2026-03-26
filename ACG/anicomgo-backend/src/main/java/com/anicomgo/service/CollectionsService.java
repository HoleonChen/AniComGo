package com.anicomgo.service;

import com.anicomgo.dto.collection.CollectionCreateRequest;
import com.anicomgo.dto.collection.UpdateCollectionProgressRequest;
import com.anicomgo.entity.Collections;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author AniComGo
 * @since 2026-03-24
 */
public interface CollectionsService extends IService<Collections> {

    void createCollection(Long currentUserId, CollectionCreateRequest request);

    Collections getCurrentUserCollectionByAnimeId(Long currentUserId, Long animeId);

    Collections updateCollectionProgress(Long currentUserId, Long animeId, UpdateCollectionProgressRequest request);

    void deleteCollection(Long currentUserId, boolean admin, Long collectionId);

    boolean hasCollected(Long userId, Long animeId);

    void adminDeleteCollection(Long collectionId);

    void batchAdminDeleteCollections(java.util.List<Long> ids);
}
