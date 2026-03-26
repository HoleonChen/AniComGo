import apiClient from './apiClient';
import type { Anime } from '../data/Model';

// API Response Interfaces
interface AnimeApiResponse {
    id: number;
    title: string;
    posterUrl: string;
    totalEpisodes: number;
    releaseDate: string;
    description: string;
    status: number;
    rating: number;
    // ... other fields potentially matching or mismatching
}

interface PageResponse<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
}

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

// Mapper to convert API camelCase to Model snake_case
const mapAnimeFromApi = (data: any): Anime => {
    // Parse tags safely
    let parsedTags: any[] = [];
    if (typeof data.tags === 'string') {
        parsedTags = data.tags.split(',').filter(Boolean).map((t: string, i: number) => ({ id: i, name: t.trim() }));
    } else if (Array.isArray(data.tags)) {
        parsedTags = data.tags;
    }

    // Parse studios safely
    let parsedStudios: any[] = [];
    if (typeof data.studios === 'string') {
        parsedStudios = data.studios.split(',').filter(Boolean).map((s: string, i: number) => ({ id: i, name: s.trim() }));
    } else if (Array.isArray(data.studios)) {
        parsedStudios = data.studios;
    }

    return {
        id: data.id,
        title: data.title,
        poster_url: data.posterUrl || data.poster_url, // fallback
        total_episodes: data.totalEpisodes || data.total_episodes,
        release_date: data.releaseDate || data.release_date,
        description: data.description,
        status: data.status,
        rating: data.rating || 0,
        tags: parsedTags,
        studios: parsedStudios,
        type: data.type || 'TV',
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        characters: data.characters,
        voice_actors: data.voiceActors
    };
};

// Mapper for creating/updating anime (Frontend -> Backend)
const mapAnimeToApi = (anime: Partial<Anime>): any => {
    return {
        title: anime.title,
        posterUrl: anime.poster_url,
        totalEpisodes: anime.total_episodes,
        releaseDate: anime.release_date,
        description: anime.description,
        status: anime.status,
        // Optional conversions for strings if required
        tags: Array.isArray(anime.tags) ? anime.tags.map(t => typeof t === 'string' ? t : t.name).join(',') : anime.tags,
        studios: Array.isArray(anime.studios) ? anime.studios.map(s => typeof s === 'string' ? s : s.name).join(',') : anime.studios
    };
};

const animeService = {
    // 分页获取番剧列表
    getAnimes: async (page = 1, size = 10, keyword?: string, status?: number): Promise<{ list: Anime[]; total: number }> => {
        const params: any = { page, size };
        if (keyword) params.title = keyword;
        if (status !== undefined) params.status = status;

        const response: ApiResponse<PageResponse<AnimeApiResponse>> = await apiClient.get('/animes', { params });
        
        if (response.code === 200) {
            return {
                list: response.data.records.map(mapAnimeFromApi),
                total: response.data.total
            };
        }
        return { list: [], total: 0 };
    },

    // 获取番剧详情
    getAnimeById: async (id: number): Promise<Anime | null> => {
        try {
            const response: ApiResponse<AnimeApiResponse> = await apiClient.get(`/animes/${id}`);
            if (response.code === 200) {
                return mapAnimeFromApi(response.data);
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    },

    // Admin: Create Anime
    createAnime: async (anime: Partial<Anime>): Promise<boolean> => {
        const payload = mapAnimeToApi(anime);
        const response: ApiResponse<any> = await apiClient.post('/animes', payload);
        return response.code === 200;
    },

    // Admin: Update Anime
    updateAnime: async (id: number, anime: Partial<Anime>): Promise<boolean> => {
        const payload = mapAnimeToApi(anime);
        const response: ApiResponse<any> = await apiClient.put(`/animes/${id}`, payload);
        return response.code === 200;
    },

    // Admin: Delete Anime
    deleteAnime: async (id: number): Promise<boolean> => {
        const response: ApiResponse<any> = await apiClient.delete(`/animes/${id}`);
        return response.code === 200;
    }
};

export default animeService;
