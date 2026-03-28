package com.anicomgo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
 * @since 2026-03-20
 */
@Getter
@Setter
@ToString
public class Users implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String username;

    @JsonIgnore
    private String password;

    private String avatarUrl;

    private String bio;

    /**
     * 0-普通用户 1-管理员
     */
    private Byte role;

    /**
     * 0-禁用 1-正常
     */
    private Byte status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
