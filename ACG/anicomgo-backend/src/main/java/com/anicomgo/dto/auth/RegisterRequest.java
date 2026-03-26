package com.anicomgo.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在 3 到 50 个字符之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度必须在 6 到 100 个字符之间")
    private String password;

    @Size(max = 255, message = "头像地址长度不能超过 255 个字符")
    private String avatarUrl;

    @Size(max = 300, message = "个人简介长度不能超过 300 个字符")
    private String bio;
}
