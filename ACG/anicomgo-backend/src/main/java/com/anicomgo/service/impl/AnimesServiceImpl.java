package com.anicomgo.service.impl;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.dto.anime.AnimeRequest;
import com.anicomgo.entity.Animes;
import com.anicomgo.mapper.AnimesMapper;
import com.anicomgo.service.AnimesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AnimesServiceImpl extends ServiceImpl<AnimesMapper, Animes> implements AnimesService {

    @Override
    @Transactional
    public void createAnime(AnimeRequest request) {
        Animes anime = buildAnime(request);
        if (!save(anime)) {
            throw new BusinessException(ResultCode.ERROR, "新增番剧失败");
        }
    }

    @Override
    @Transactional
    public void updateAnime(Long animeId, AnimeRequest request) {
        Animes existingAnime = getById(animeId);
        if (existingAnime == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "番剧不存在");
        }

        Animes anime = buildAnime(request);
        anime.setId(animeId);
        if (!updateById(anime)) {
            throw new BusinessException(ResultCode.ERROR, "修改番剧失败");
        }
    }

    @Override
    @Transactional
    public void deleteAnime(Long animeId) {
        Animes existingAnime = getById(animeId);
        if (existingAnime == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "番剧不存在");
        }
        if (!removeById(animeId)) {
            throw new BusinessException(ResultCode.ERROR, "删除番剧失败");
        }
    }

    private Animes buildAnime(AnimeRequest request) {
        Animes anime = new Animes();
        anime.setTitle(request.getTitle().trim());
        anime.setPosterUrl(trimToNull(request.getPosterUrl()));
        anime.setTags(trimToNull(request.getTags()));
        anime.setStudios(trimToNull(request.getStudios()));
        anime.setRating(request.getRating());
        anime.setTotalEpisodes(request.getTotalEpisodes());
        anime.setReleaseDate(request.getReleaseDate());
        anime.setDescription(trimToNull(request.getDescription()));
        anime.setStatus(request.getStatus());
        return anime;
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
