package com.anicomgo.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class BatchDeleteCollectionsRequest {

    @NotEmpty(message = "收藏 ID 列表不能为空")
    private List<@NotNull(message = "收藏 ID 不能为空") @Min(value = 1, message = "收藏 ID 不合法") Long> ids;
}
