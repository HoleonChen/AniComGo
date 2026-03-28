package com.anicomgo.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在 3 到 50 个字符之间")
    private String username;

    @Size(max = 255, message = "头像地址长度不能超过 255 个字符")
    private String avatarUrl;

    @Size(max = 300, message = "个人简介长度不能超过 300 个字符")
    private String bio;
}
