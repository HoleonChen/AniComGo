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
 * 
 * </p>
 *
 * @author AniComGo
 * @since 2026-03-23
 */
@Getter
@Setter
@ToString
public class Comments implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long animeId;

    private Long parentId;

    private String content;

    private Integer likesCount;

    /**
     * 0-隐藏 1-正常
     */
    private Byte status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
