package com.anicomgo.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentLikeResponse {

    private Long commentId;

    private Integer likesCount;

    private Boolean liked;
}
