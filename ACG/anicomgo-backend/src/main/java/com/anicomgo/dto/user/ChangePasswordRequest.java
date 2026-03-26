package com.anicomgo.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "旧密码不能为空")
    @Size(max = 100, message = "旧密码长度不能超过 100 个字符")
    private String oldPassword;

    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 100, message = "新密码长度必须在 6 到 100 个字符之间")
    private String newPassword;
}
