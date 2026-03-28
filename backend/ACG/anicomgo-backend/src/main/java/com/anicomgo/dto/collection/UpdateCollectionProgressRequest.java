package com.anicomgo.dto.collection;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCollectionProgressRequest {

    @NotNull(message = "追番进度不能为空")
    @Min(value = 0, message = "追番进度不能小于 0")
    private Integer progress;
}
