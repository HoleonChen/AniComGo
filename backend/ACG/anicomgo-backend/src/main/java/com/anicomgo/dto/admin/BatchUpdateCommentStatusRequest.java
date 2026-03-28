package com.anicomgo.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class BatchUpdateCommentStatusRequest {

    @NotEmpty(message = "评论 ID 列表不能为空")
    private List<@NotNull(message = "评论 ID 不能为空") @Min(value = 1, message = "评论 ID 不合法") Long> ids;

    @NotNull(message = "评论状态不能为空")
    @Min(value = 0, message = "评论状态不合法")
    @Max(value = 1, message = "评论状态不合法")
    private Byte status;
}
