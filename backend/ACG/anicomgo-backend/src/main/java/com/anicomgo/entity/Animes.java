package com.anicomgo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * <p>
 * 
 * </p>
 *
 * @author AniComGo
 * @since 2026-03-20
 */
@Getter
@Setter
@ToString
public class Animes implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String title;

    private String posterUrl;

    private String tags;

    private String studios;

    private BigDecimal rating;

    private Integer totalEpisodes;

    private LocalDate releaseDate;

    private String description;

    /**
     * 1-连载中 2-已完结
     */
    private Byte status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
