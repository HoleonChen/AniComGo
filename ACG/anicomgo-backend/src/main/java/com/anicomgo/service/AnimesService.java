package com.anicomgo.service;

import com.anicomgo.dto.anime.AnimeRequest;
import com.anicomgo.entity.Animes;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author AniComGo
 * @since 2026-03-20
 */
public interface AnimesService extends IService<Animes> {

    void createAnime(AnimeRequest request);

    void updateAnime(Long animeId, AnimeRequest request);

    void deleteAnime(Long animeId);
}
