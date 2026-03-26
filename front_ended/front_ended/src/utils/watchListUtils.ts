import type { Collection } from '../data/Model';

// --- 辅助函数：判断是否在追 ---
export const isWatchingCollection = (collection: Collection): boolean => {
    return collection.anime ? collection.progress < collection.anime.total_episodes : false;
};

// --- Service Logic ---
export const processUserWatchList = (collections: Collection[]) => {
    const watching = collections.filter(c => isWatchingCollection(c));
    const completed = collections.filter(c => !isWatchingCollection(c));
    return { watching, completed };
};
