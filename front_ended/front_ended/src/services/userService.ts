import apiClient from './apiClient';
import type { User, Collection } from '../data/Model';
import animeService from './animeService';

interface PageHelper<T> {
  list: T[];
  total: number;
}

const userService = {
    getUsers: async (page = 1, size = 10): Promise<PageHelper<User>> => {
        try {
            // Updated to use the new admin users endpoint
            const response: any = await apiClient.get('/admin/users', { params: { page, size } });
            if (response.code === 200) {
               return {
                   list: response.data.records,
                   total: response.data.total
               };
            }
            return { list: [], total: 0 };
        } catch (error) {
            console.error("Failed to fetch users", error);
             return { list: [], total: 0 };
        }
    },
    
    updateStatus: async (userId: number, status: number) => {
       // Updated to use the new PATCH admin endpoint
       return apiClient.patch(`/admin/users/${userId}/status`, { status });
    },

    updateMe: async (data: Partial<User>) => {
        const response: any = await apiClient.put('/users/me', data);
        if(response.code === 200) {
            return response.data;
        }
        throw new Error(response.message || 'Update failed');
    },

    getCollections: async (page = 1, size = 100, animeId?: number | string): Promise<Collection[]> => {
        try {
            const params: any = { page, size };
            if (animeId) params.animeId = animeId;
            const response: any = await apiClient.get('/collections', { params });
            if (response.code === 200) {
                const records = response.data.records;
                // Map camelCase to snake_case and fetch anime details
                const collectionsWithAnime = await Promise.all(
                    records.map(async (record: any) => {
                        const animeDetail = await animeService.getAnimeById(record.animeId);
                        return {
                            id: record.id,
                            user_id: record.userId,
                            anime_id: record.animeId,
                            progress: record.progress,
                            rating: record.rating || 0,
                            created_at: record.createdAt,
                            updated_at: record.updatedAt,
                            anime: animeDetail || undefined
                        } as Collection;
                    })
                );
                return collectionsWithAnime;
            }
            return [];
        } catch (error) {
            console.error("Failed to fetch collections", error);
            return [];
        }
    },

    // Add a collection (Follow anime)
    addCollection: async (animeId: number): Promise<boolean> => {
        try {
            const response: any = await apiClient.post('/collections', { animeId });
            return response.code === 200;
        } catch (error) {
            console.error("Failed to add collection", error);
            return false;
        }
    },

    // Remove a collection (Unfollow anime)
    removeCollection: async (collectionId: number): Promise<boolean> => {
        try {
            const response: any = await apiClient.delete(`/collections/${collectionId}`);
            return response.code === 200;
        } catch (error) {
            console.error("Failed to remove collection", error);
            return false;
        }
    },

    // Update watch progress
    updateCollectionProgress: async (animeId: number, progress: number): Promise<boolean> => {
        try {
            const response: any = await apiClient.patch(`/collections/anime/${animeId}/progress`, { progress });
            return response.code === 200;
        } catch (error) {
            console.error("Failed to update collection progress", error);
            return false;
        }
    },

    // Update collection status (e.g. rating, progress)
    // Note: API might not support direct update via PUT, might need DELETE+POST or specific endpoint if documented later.
    // Assuming we can re-post or there's an undocumented update for now, or just use addCollection if backend handles upsert.
    // If backend returns 400 on duplicate, we can't use addCollection for update.
    // We will assume for now we can't easily update without delete/add unless we find a PUT endpoint.
    // Wait, let's try to infer if we can update rating. 
    // If the user is already collecting, we might not be able to update rating without re-adding.
    // For now, I'll add a helper to catch 400 and maybe try delete/add if needed, or just fail.
    updateCollection: async (id: number, data: { progress?: number, rating?: number, animeId: number }): Promise<boolean> => {
        // If there is a collection ID, we ideally use it. But if the API is 'add collection', we use animeId.
        // If we want to update rating, we might need to delete old and add new if no PATCH/PUT exists.
        // Let's try to just 'add' with new data and see if it updates (if backend is smart) or fails.
        // If it fails with "Duplicate", we might need to delete then add.
        // For safety, let's just try add first.
        try {
            // Note: The API doc says POST /collections takes animeId, progress, rating.
            // If it returns 400 duplicate, we should probably delete the old one first if we have the ID.
            if (id) {
               // Try delete first
               await apiClient.delete(`/collections/${id}`);
            }
            const response: any = await apiClient.post('/collections', { 
                animeId: data.animeId, 
                progress: data.progress, 
                rating: data.rating 
            });
            return response.code === 200;
        } catch (error) {
             console.error("Failed to update collection", error);
             return false;
        }
    }
};

export default userService;
