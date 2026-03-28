package com.anicomgo.dto.collection;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CollectionCreateRequest {

    @NotNull(message = "番剧 ID 不能为空")
    @Min(value = 1, message = "番剧 ID 不合法")
    private Long animeId;

    @Min(value = 0, message = "观看进度不能小于 0")
    private Integer progress;

    @Min(value = 1, message = "评分不能小于 1")
    @Max(value = 5, message = "评分不能大于 5")
    private Integer rating;
}
