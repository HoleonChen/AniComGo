package com.anicomgo.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentUpdateRequest {

    @NotBlank(message = "评论内容不能为空")
    @Size(max = 1000, message = "评论内容长度不能超过 1000 个字符")
    private String content;
}
