package com.anicomgo.service;

import com.anicomgo.dto.comment.CommentCreateRequest;
import com.anicomgo.dto.comment.CommentLikeResponse;
import com.anicomgo.dto.comment.CommentUpdateRequest;
import com.anicomgo.entity.Comments;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author AniComGo
 * @since 2026-03-23
 */
public interface CommentsService extends IService<Comments> {

    void createComment(Long currentUserId, CommentCreateRequest request);

    void updateComment(Long currentUserId, boolean admin, Long commentId, CommentUpdateRequest request);

    void deleteComment(Long currentUserId, boolean admin, Long commentId);

    CommentLikeResponse getCommentLikeStatus(Long currentUserId, Long commentId);

    CommentLikeResponse likeComment(Long currentUserId, Long commentId);

    CommentLikeResponse unlikeComment(Long currentUserId, Long commentId);

    void updateCommentStatus(Long commentId, Byte status);

    void adminDeleteComment(Long commentId);

    void batchUpdateCommentStatus(java.util.List<Long> ids, Byte status);
}
