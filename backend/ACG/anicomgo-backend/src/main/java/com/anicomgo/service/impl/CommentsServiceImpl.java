package com.anicomgo.service.impl;

import com.anicomgo.common.exception.BusinessException;
import com.anicomgo.common.result.ResultCode;
import com.anicomgo.dto.comment.CommentCreateRequest;
import com.anicomgo.dto.comment.CommentLikeResponse;
import com.anicomgo.dto.comment.CommentUpdateRequest;
import com.anicomgo.entity.Animes;
import com.anicomgo.entity.CommentLikes;
import com.anicomgo.entity.Comments;
import com.anicomgo.mapper.CommentLikesMapper;
import com.anicomgo.mapper.CommentsMapper;
import com.anicomgo.service.AnimesService;
import com.anicomgo.service.CollectionsService;
import com.anicomgo.service.CommentsService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentsServiceImpl extends ServiceImpl<CommentsMapper, Comments> implements CommentsService {

    private final AnimesService animesService;
    private final CollectionsService collectionsService;
    private final CommentLikesMapper commentLikesMapper;

    public CommentsServiceImpl(
            AnimesService animesService,
            CollectionsService collectionsService,
            CommentLikesMapper commentLikesMapper
    ) {
        this.animesService = animesService;
        this.collectionsService = collectionsService;
        this.commentLikesMapper = commentLikesMapper;
    }

    @Override
    @Transactional
    public void createComment(Long currentUserId, CommentCreateRequest request) {
        Animes anime = animesService.getById(request.getAnimeId());
        if (anime == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "番剧不存在");
        }
        if (!collectionsService.hasCollected(currentUserId, request.getAnimeId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "你必须先收藏该番剧后才能评论");
        }

        validateParentComment(request.getParentId(), request.getAnimeId());

        Comments comment = new Comments();
        comment.setUserId(currentUserId);
        comment.setAnimeId(request.getAnimeId());
        comment.setParentId(request.getParentId());
        comment.setContent(request.getContent().trim());
        comment.setLikesCount(0);
        comment.setStatus((byte) 1);

        if (!save(comment)) {
            throw new BusinessException(ResultCode.ERROR, "发表评论失败");
        }
    }

    @Override
    @Transactional
    public void updateComment(Long currentUserId, boolean admin, Long commentId, CommentUpdateRequest request) {
        Comments existingComment = getById(commentId);
        if (existingComment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在");
        }
        ensureCommentOwner(existingComment, currentUserId, admin);

        existingComment.setContent(request.getContent().trim());
        if (!updateById(existingComment)) {
            throw new BusinessException(ResultCode.ERROR, "修改评论失败");
        }
    }

    @Override
    @Transactional
    public void deleteComment(Long currentUserId, boolean admin, Long commentId) {
        Comments existingComment = getById(commentId);
        if (existingComment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在");
        }
        ensureCommentOwner(existingComment, currentUserId, admin);

        removeCommentLikes(commentId);
        if (!removeById(commentId)) {
            throw new BusinessException(ResultCode.ERROR, "删除评论失败");
        }
    }

    @Override
    public CommentLikeResponse getCommentLikeStatus(Long currentUserId, Long commentId) {
        Comments comment = getVisibleComment(commentId);
        return buildLikeResponse(comment, hasLiked(currentUserId, commentId));
    }

    @Override
    @Transactional
    public CommentLikeResponse likeComment(Long currentUserId, Long commentId) {
        Comments comment = getVisibleComment(commentId);
        if (hasLiked(currentUserId, commentId)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "你已经点赞过该评论");
        }

        CommentLikes commentLike = new CommentLikes();
        commentLike.setUserId(currentUserId);
        commentLike.setCommentId(commentId);
        if (commentLikesMapper.insert(commentLike) <= 0) {
            throw new BusinessException(ResultCode.ERROR, "评论点赞失败");
        }

        comment.setLikesCount(comment.getLikesCount() == null ? 1 : comment.getLikesCount() + 1);
        if (!updateById(comment)) {
            throw new BusinessException(ResultCode.ERROR, "评论点赞失败");
        }
        return buildLikeResponse(comment, true);
    }

    @Override
    @Transactional
    public CommentLikeResponse unlikeComment(Long currentUserId, Long commentId) {
        Comments comment = getVisibleComment(commentId);
        CommentLikes commentLike = commentLikesMapper.selectOne(new LambdaQueryWrapper<CommentLikes>()
                .eq(CommentLikes::getUserId, currentUserId)
                .eq(CommentLikes::getCommentId, commentId));
        if (commentLike == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "你还没有点赞该评论");
        }

        if (commentLikesMapper.deleteById(commentLike.getId()) <= 0) {
            throw new BusinessException(ResultCode.ERROR, "取消点赞失败");
        }

        int currentLikes = comment.getLikesCount() == null ? 0 : comment.getLikesCount();
        comment.setLikesCount(Math.max(0, currentLikes - 1));
        if (!updateById(comment)) {
            throw new BusinessException(ResultCode.ERROR, "取消点赞失败");
        }
        return buildLikeResponse(comment, false);
    }

    @Override
    @Transactional
    public void updateCommentStatus(Long commentId, Byte status) {
        Comments comment = getById(commentId);
        if (comment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在");
        }
        comment.setStatus(status);
        if (!updateById(comment)) {
            throw new BusinessException(ResultCode.ERROR, "修改评论状态失败");
        }
    }

    @Override
    @Transactional
    public void adminDeleteComment(Long commentId) {
        Comments comment = getById(commentId);
        if (comment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在");
        }
        removeCommentLikes(commentId);
        if (!removeById(commentId)) {
            throw new BusinessException(ResultCode.ERROR, "删除评论失败");
        }
    }

    @Override
    @Transactional
    public void batchUpdateCommentStatus(List<Long> ids, Byte status) {
        List<Comments> comments = listByIds(ids);
        if (comments.size() != ids.size()) {
            throw new BusinessException(ResultCode.NOT_FOUND, "部分评论不存在");
        }
        for (Comments comment : comments) {
            comment.setStatus(status);
        }
        if (!updateBatchById(comments)) {
            throw new BusinessException(ResultCode.ERROR, "批量修改评论状态失败");
        }
    }

    private void validateParentComment(Long parentId, Long animeId) {
        if (parentId == null) {
            return;
        }
        Comments parentComment = getById(parentId);
        if (parentComment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "父评论不存在");
        }
        if (!animeId.equals(parentComment.getAnimeId())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "父评论不属于当前番剧");
        }
    }

    private void ensureCommentOwner(Comments comment, Long currentUserId, boolean admin) {
        if (!admin && !currentUserId.equals(comment.getUserId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "你只能操作自己的评论");
        }
    }

    private Comments getVisibleComment(Long commentId) {
        Comments comment = getById(commentId);
        if (comment == null || comment.getStatus() == null || comment.getStatus() != 1) {
            throw new BusinessException(ResultCode.NOT_FOUND, "评论不存在");
        }
        return comment;
    }

    private boolean hasLiked(Long currentUserId, Long commentId) {
        return commentLikesMapper.selectCount(new LambdaQueryWrapper<CommentLikes>()
                .eq(CommentLikes::getUserId, currentUserId)
                .eq(CommentLikes::getCommentId, commentId)) > 0;
    }

    private CommentLikeResponse buildLikeResponse(Comments comment, boolean liked) {
        return new CommentLikeResponse(comment.getId(), comment.getLikesCount(), liked);
    }

    private void removeCommentLikes(Long commentId) {
        commentLikesMapper.delete(new LambdaQueryWrapper<CommentLikes>()
                .eq(CommentLikes::getCommentId, commentId));
    }
}
