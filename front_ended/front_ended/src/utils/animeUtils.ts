import type { Anime, Collection } from '../data/Model';

// 辅助函数：根据状态生成更新信息
export const getUpdateInfo = (anime: Anime): string => {
    if (anime.type === 'Movie') return '剧场版';
    if (anime.status === 2) return `全${anime.total_episodes}话`;
    if (anime.status === 1) return `更新至第${Math.max(1, anime.total_episodes - 2)}话`; // 模拟更新进度
    return '即将开播';
};

// --- 辅助函数：判断是否在追 ---
export const isWatching = (collection: Collection): boolean => {
    return collection.anime ? collection.progress < collection.anime.total_episodes : false;
};

// --- 辅助函数：获取用户的追番和已完成的番剧 ---
// This returns { watching, completed }
export const processWatchList = (collections: Collection[]) => {
    const watching = collections.filter(c => isWatching(c));
    const completed = collections.filter(c => !isWatching(c));
    return { watching, completed };
};

