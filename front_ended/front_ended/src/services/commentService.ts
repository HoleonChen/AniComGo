import apiClient from './apiClient';
import type { Comment } from '../data/Model';

interface PageHelper<T> {
    list: T[];
    total: number;
}

const commentService = {
    // Audit related
    getCommentsToAudit: async (page = 1, size = 10): Promise<PageHelper<Comment>> => {
        try {
            // Using the new admin endpoint for querying all comments
            const response: any = await apiClient.get('/admin/comments', { params: { page, size } });
            if (response.code === 200) {
                 return {
                   list: response.data.records,
                   total: response.data.total
               };
            }
             return { list: [], total: 0 };
        } catch (error) {
            console.error("Failed to fetch comments", error);
            return { list: [], total: 0 };
        }
    },

    auditComment: async (commentId: number, approved: boolean) => {
        // Using the new PATCH admin endpoint: PATCH /admin/comments/{id}/status { status: 1 (visible) | 0 (hidden) }
        const status = approved ? 1 : 0; 
        return apiClient.patch(`/admin/comments/${commentId}/status`, { status });
    },

    // Public / User methods
    getComments: async (page = 1, size = 10, animeId?: number | string): Promise<PageHelper<Comment>> => {
        try {
            const params: any = { page, size };
            if (animeId) params.animeId = animeId;
            const response: any = await apiClient.get('/comments', { params });
            if (response.code === 200) {
                 const records = response.data.records.map((c: any) => ({
                     ...c,
                     likes_count: c.likesCount !== undefined ? c.likesCount : c.likes_count,
                 }));
                 return {
                   list: records,
                   total: response.data.total
               };
            }
             return { list: [], total: 0 };
        } catch (error) {
            console.error("Failed to fetch comments", error);
            return { list: [], total: 0 };
        }
    },

    getCommentLikeStatus: async (commentId: number): Promise<{likesCount?: number; liked?: boolean}> => {
        try {
            const response: any = await apiClient.get(`/comments/${commentId}/like-status`);
            if (response.code === 200) {
                 return response.data;
            }
            return {};
        } catch(error) {
             return {};
        }
    },

    addComment: async (animeId: number, content: string, parentId?: number): Promise<boolean> => {
        try {
            const payload: any = { animeId, content };
            if (parentId) payload.parentId = parentId;
            const response: any = await apiClient.post('/comments', payload);
            return response.code === 200;
        } catch (error) {
             console.error("Failed to add comment", error);
             return false;
        }
    },

    likeComment: async (commentId: number): Promise<{likesCount?: number; liked?: boolean}> => {
        try {
            const response: any = await apiClient.patch(`/comments/${commentId}/like`);
            if (response.code === 200) {
                 return response.data;
            }
            return {};
        } catch(error) {
             console.error("Failed to like comment", error);
             return {};
        }
    },

    unlikeComment: async (commentId: number): Promise<{likesCount?: number; liked?: boolean}> => {
        try {
             const response: any = await apiClient.delete(`/comments/${commentId}/like`);
             if (response.code === 200) {
                  return response.data;
             }
             return {};
        } catch(error) {
             console.error("Failed to unlike comment", error);
             return {};
        }
    }
};

export default commentService;
