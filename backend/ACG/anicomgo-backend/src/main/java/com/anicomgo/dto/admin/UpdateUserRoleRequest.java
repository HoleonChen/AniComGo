package com.anicomgo.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {

    @NotNull(message = "用户角色不能为空")
    @Min(value = 0, message = "用户角色不合法")
    @Max(value = 1, message = "用户角色不合法")
    private Byte role;
}
