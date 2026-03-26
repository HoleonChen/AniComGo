package com.anicomgo.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCommentStatusRequest {

    @NotNull(message = "评论状态不能为空")
    @Min(value = 0, message = "评论状态不合法")
    @Max(value = 1, message = "评论状态不合法")
    private Byte status;
}
