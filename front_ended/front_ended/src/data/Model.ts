// 1. 严格的类型定义
export interface Tag {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Studio {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Character {
    id: number;
    name: string;
    description: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
}

export interface VoiceActor {
    id: number;
    name: string;
    avatar_url?: string; // Add avatar_url optional
    created_at: string;
    updated_at: string;
}

export interface Anime {
    id: number;
    title: string;          // VARCHAR(100)
    poster_url: string;     // VARCHAR(255)
    total_episodes: number; // INT
    release_date: string;   // DATE (YYYY-MM-DD)
    description: string;    // TEXT
    status: number;         // TINYINT (0: 未开播, 1: 连载中, 2: 已完结)
    rating: number;         // 聚合评分
    tags: Tag[];            // 关联标签
    studios: Studio[];      // 关联工作室
    type?: 'TV' | 'Movie';  // 类型：TV | Movie
    created_at?: string;
    updated_at?: string;
    // 关联的角色和声优 (前端展示用)
    characters?: Character[];
    voice_actors?: VoiceActor[];
}

export interface User {
    id: number;
    username: string;       // VARCHAR(50)
    password?: string;      // VARCHAR(255)
    avatar_url: string;     // VARCHAR(255)
    bio: string;            // VARCHAR(255)
    role: number;           // TINYINT (0: 普通用户, 1: 管理员)
    status: number;         // TINYINT (0: 禁用, 1: 正常)
    created_at: string;     // DATETIME
    updated_at: string;     // DATETIME
}

export interface Collection {
    id: number;
    user_id: number;
    anime_id: number;
    progress: number;       // 观看进度 (当前集数)
    rating: number;         // 用户评分 (0-10)
    created_at: string;
    updated_at: string;
    // 关联的番剧数据 (便于前端使用)
    anime?: Anime;
}

// 定义符合数据库结构的 Comment 接口
export interface Comment {
    id: number; // BIGINT
    user_id: number; // BIGINT
    anime_id: number; // BIGINT
    parent_id: number | null; // BIGINT, nullable
    content: string; // TEXT
    likes_count: number; // INT
    status: number; // TINYINT
    created_at: string; // DATETIME
    updated_at: string; // DATETIME
    // 模拟的关联用户数据 (前端展示用)
    user?: {
        username: string;
        avatar: string;
    };
    // 前端交互状态
    isLiked?: boolean;
}

// 辅助函数：获取评分等级文案和颜色
export const getRatingLevel = (rating: number) => {
    if (rating >= 0 && rating < 1) return { text: '拉完了', color: '#ffffff' }; // 白字
    if (rating >= 1 && rating < 2) return { text: 'NPC', color: '#fef3c7' }; // 浅黄色 (tailwind amber-100 approx)
    if (rating >= 2 && rating < 3) return { text: '人上人', color: '#fcd34d' }; // 黄色 (amber-300)
    if (rating >= 3 && rating < 4) return { text: '顶级', color: '#f97316' }; // 橙色 (orange-500)
    if (rating >= 4 && rating < 5) return { text: '夯', color: '#ef4444' }; // 红色 (red-500)
    if (rating >= 5) return { text: '夯爆了', color: '#dc2626' }; // 深红 (red-600)
    return { text: '暂无', color: '#9ca3af' };
};
