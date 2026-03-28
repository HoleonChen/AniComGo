package com.anicomgo.dto.comment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentCreateRequest {

    @NotNull(message = "番剧 ID 不能为空")
    @Min(value = 1, message = "番剧 ID 不合法")
    private Long animeId;

    @Min(value = 1, message = "父评论 ID 不合法")
    private Long parentId;

    @NotBlank(message = "评论内容不能为空")
    @Size(max = 1000, message = "评论内容长度不能超过 1000 个字符")
    private String content;
}
