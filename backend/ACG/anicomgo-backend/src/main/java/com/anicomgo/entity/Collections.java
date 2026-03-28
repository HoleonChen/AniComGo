package com.anicomgo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * 收藏表
 * </p>
 *
 * @since 2026-03-23
 */
@Getter
@Setter
@ToString
public class Collections implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long animeId;

    private Integer progress;

    private Integer rating;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}