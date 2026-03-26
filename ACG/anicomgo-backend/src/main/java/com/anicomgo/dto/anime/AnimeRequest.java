package com.anicomgo.dto.anime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.time.LocalDate;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class AnimeRequest {

    @NotBlank(message = "番剧标题不能为空")
    @Size(max = 100, message = "番剧标题长度不能超过 100 个字符")
    private String title;

    @Size(max = 500, message = "海报地址长度不能超过 500 个字符")
    private String posterUrl;

    @Size(max = 255, message = "番剧标签长度不能超过 255 个字符")
    private String tags;

    @Size(max = 255, message = "制作公司长度不能超过 255 个字符")
    private String studios;

    @DecimalMin(value = "0.0", inclusive = true, message = "综合评分不能小于 0")
    @DecimalMax(value = "5.0", inclusive = true, message = "综合评分不能大于 5")
    private BigDecimal rating;

    @Min(value = 0, message = "总集数不能小于 0")
    @Max(value = 100000, message = "总集数超出允许范围")
    private Integer totalEpisodes;

    private LocalDate releaseDate;

    @Size(max = 1000, message = "番剧简介长度不能超过 1000 个字符")
    private String description;

    @NotNull(message = "番剧状态不能为空")
    @Min(value = 1, message = "番剧状态不合法")
    @Max(value = 2, message = "番剧状态不合法")
    private Byte status;
}
