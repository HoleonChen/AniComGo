// 1. 严格的类型定义
export interface Tag {
    id: number;
    name: string;
}

export interface Studio {
    id: number;
    name: string;
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
    type?: 'TV' | 'Movie';  // 类型：TV | Movie (新增)
}

// 辅助函数：根据状态生成更新信息
export const getUpdateInfo = (anime: Anime): string => {
    if (anime.type === 'Movie') return '剧场版';
    if (anime.status === 2) return `全${anime.total_episodes}话`;
    if (anime.status === 1) return `更新至第${Math.max(1, anime.total_episodes - 2)}话`; // 模拟更新进度
    return '即将开播';
};

// 2. 模拟数据
export const mockAnimes: Anime[] = [
    // --- 经典/热门 (HomePage用) ---
    {
        id: 1,
        title: '葬送的芙莉莲',
        poster_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
        total_episodes: 28,
        release_date: '2023-09-29',
        description: '勇者一行人打倒魔王之后的故事...',
        status: 2,
        rating: 4.9,
        tags: [{ id: 1, name: '奇幻' }, { id: 2, name: '治愈' }],
        studios: [{ id: 1, name: 'Madhouse' }],
        type: 'TV'
    },
    {
        id: 2,
        title: '孤独摇滚！',
        poster_url: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        total_episodes: 12,
        release_date: '2022-10-09',
        description: '社恐少女的乐队生活...',
        status: 2,
        rating: 4.8,
        tags: [{ id: 3, name: '音乐' }, { id: 4, name: '日常' }],
        studios: [{ id: 2, name: 'CloverWorks' }],
        type: 'TV'
    },
    {
        id: 3,
        title: '咒术回战 第二季',
        poster_url: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        total_episodes: 23,
        release_date: '2023-07-06',
        description: '怀玉·玉折篇 & 涉谷事变篇',
        status: 2,
        rating: 4.5,
        tags: [{ id: 5, name: '热血' }, { id: 6, name: '战斗' }],
        studios: [{ id: 3, name: 'MAPPA' }],
        type: 'TV'
    },
    {
        id: 4,
        title: '间谍过家家',
        poster_url: 'https://img.yzcdn.cn/vant/apple-3.jpg',
        total_episodes: 25,
        release_date: '2022-04-09',
        description: '间谍、杀手与超能力者的家庭喜剧',
        status: 2,
        rating: 4.6,
        tags: [{ id: 7, name: '喜剧' }, { id: 8, name: '亲子' }],
        studios: [{ id: 4, name: 'WIT STUDIO' }, { id: 2, name: 'CloverWorks' }],
        type: 'TV'
    },
    {
        id: 6,
        title: '排球少年！！',
        poster_url: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        total_episodes: 85,
        release_date: '2014-04-06',
        description: '飞吧，无法在地面上停留的乌鸦们',
        status: 2,
        rating: 4.9,
        tags: [{ id: 10, name: '运动' }, { id: 5, name: '热血' }],
        studios: [{ id: 6, name: 'Production I.G' }],
        type: 'TV'
    },

    // --- 本季新番 / 连载中 (SeasonPage用) ---
    // 假设当前时间 2026-03-18 (周三)
    // 连载中 status = 1

    // 周一 (Monday)
    {
        id: 11,
        title: '转生史莱姆 第三季',
        poster_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
        total_episodes: 24,
        release_date: '2026-01-05', // Jan 5 2026 was Monday
        description: '建国之后的魔王利姆露...',
        status: 1,
        rating: 4.6,
        tags: [{ id: 1, name: '奇幻' }, { id: 11, name: '异世界' }],
        studios: [{ id: 8, name: '8bit' }],
        type: 'TV'
    },
    {
        id: 12,
        title: '狼与香辛料 新版',
        poster_url: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        total_episodes: 25,
        release_date: '2026-01-05',
        description: '行商罗伦斯与贤狼赫萝的旅程',
        status: 1,
        rating: 4.8,
        tags: [{ id: 1, name: '奇幻' }, { id: 12, name: '恋爱' }],
        studios: [{ id: 9, name: 'Passione' }],
        type: 'TV'
    },

    // 周二 (Tuesday)
    {
        id: 13,
        title: '夏目友人帐 漆',
        poster_url: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        total_episodes: 13,
        release_date: '2026-01-06',
        description: '温韾治愈的妖怪故事第七季',
        status: 1,
        rating: 4.9,
        tags: [{ id: 2, name: '治愈' }, { id: 13, name: '妖怪' }],
        studios: [{ id: 10, name: 'Shuka' }],
        type: 'TV'
    },

    // 周三 (Wednesday) - 今天!
    {
        id: 14,
        title: '实吉同学',
        poster_url: 'https://img.yzcdn.cn/vant/apple-3.jpg',
        total_episodes: 12,
        release_date: '2026-01-07',
        description: '超能力者的校园日常',
        status: 1,
        rating: 4.5,
        tags: [{ id: 4, name: '日常' }, { id: 7, name: '喜剧' }],
        studios: [{ id: 2, name: 'CloverWorks' }],
        type: 'TV'
    },
    {
        id: 15,
        title: '为美好的世界献上祝福! 3',
        poster_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
        total_episodes: 11,
        release_date: '2026-01-07',
        description: '智障女神与家里蹲的异世界冒险',
        status: 1,
        rating: 4.7,
        tags: [{ id: 7, name: '喜剧' }, { id: 11, name: '异世界' }],
        studios: [{ id: 11, name: 'Drive' }],
        type: 'TV'
    },

    // 周四 (Thursday)
    {
        id: 5, // 之前的数据，改为本季连载
        title: '迷宫饭',
        poster_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
        total_episodes: 24,
        release_date: '2026-01-08',
        description: '在地下城里享受美食吧！',
        status: 1,
        rating: 4.7,
        tags: [{ id: 9, name: '美食' }, { id: 1, name: '奇幻' }],
        studios: [{ id: 5, name: 'TRIGGER' }],
        type: 'TV'
    },

    // 周五 (Friday)
    {
        id: 16,
        title: '魔法科高校的劣等生 新篇',
        poster_url: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        total_episodes: 13,
        release_date: '2026-01-09',
        description: '司波达也的龙傲天传说',
        status: 1,
        rating: 4.4,
        tags: [{ id: 1, name: '奇幻' }, { id: 14, name: '科幻' }],
        studios: [{ id: 8, name: '8bit' }],
        type: 'TV'
    },

    // 周六 (Saturday)
    {
        id: 17,
        title: '怪兽8号',
        poster_url: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        total_episodes: 12,
        release_date: '2026-01-10',
        description: '变成怪兽的大叔拯救世界',
        status: 1,
        rating: 4.6,
        tags: [{ id: 5, name: '热血' }, { id: 6, name: '战斗' }],
        studios: [{ id: 6, name: 'Production I.G' }],
        type: 'TV'
    },
    {
        id: 18,
        title: '黑执事 寄宿学校篇',
        poster_url: 'https://img.yzcdn.cn/vant/apple-3.jpg',
        total_episodes: 11,
        release_date: '2026-01-10',
        description: '塞巴斯蒂安的校园潜入任务',
        status: 1,
        rating: 4.7,
        tags: [{ id: 15, name: '悬疑' }, { id: 1, name: '奇幻' }],
        studios: [{ id: 2, name: 'CloverWorks' }],
        type: 'TV'
    },

    // 周日 (Sunday)
    {
        id: 19,
        title: '无职转生 II',
        poster_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
        total_episodes: 25,
        release_date: '2026-01-11',
        description: '鲁迪乌斯的异世界人生',
        status: 1,
        rating: 4.8,
        tags: [{ id: 11, name: '异世界' }, { id: 12, name: '恋爱' }],
        studios: [{ id: 12, name: 'Studio Bind' }],
        type: 'TV'
    },

    // --- 剧场版 (Movie) ---
    {
        id: 20,
        title: '剧场版 排球少年！！ 垃圾场决战',
        poster_url: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        total_episodes: 1,
        release_date: '2026-02-16',
        description: '乌野高中 vs 音驹高中 宿命的对决',
        status: 1, // 正在上映
        rating: 5.0,
        tags: [{ id: 10, name: '运动' }, { id: 5, name: '热血' }],
        studios: [{ id: 6, name: 'Production I.G' }],
        type: 'Movie'
    },
    {
        id: 21,
        title: '剧场版 蓝色监狱 -EPIOSDE 凪-',
        poster_url: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        total_episodes: 1,
        release_date: '2026-03-01',
        description: '天才觉醒的故事',
        status: 1,
        rating: 4.7,
        tags: [{ id: 10, name: '运动' }, { id: 5, name: '热血' }],
        studios: [{ id: 8, name: '8bit' }],
        type: 'Movie'
    },
    {
        id: 22,
        title: '大侦探皮卡丘 2',
        poster_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
        total_episodes: 1,
        release_date: '2026-01-20',
        description: '皮卡丘的新冒险',
        status: 2, // 已下映?
        rating: 4.3,
        tags: [{ id: 7, name: '喜剧' }, { id: 8, name: '亲子' }],
        studios: [{ id: 13, name: 'OLM' }],
        type: 'Movie'
    }
];

// --- 用户数据结构 ---
export interface User {
    id: number;
    username: string;       // VARCHAR(50)
    avatar_url: string;     // VARCHAR(255)
    bio: string;            // VARCHAR(255)
    role: number;           // TINYINT (0: 普通用户, 1: 管理员)
    status: number;         // TINYINT (0: 禁用, 1: 正常)
    created_at: string;     // DATETIME
    updated_at: string;     // DATETIME
}

// --- 收藏数据结构 ---
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

// --- 模拟当前用户 ---
export const mockCurrentUser: User = {
    id: 1,
    username: '动漫迷小王',
    avatar_url: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    bio: '热爱二次元的程序员，追番已成为生活的一部分 💫',
    role: 0,
    status: 1,
    created_at: '2023-01-15T10:30:00',
    updated_at: '2026-03-19T14:20:00'
};

// --- 模拟用户收藏 ---
export const mockUserCollections: Collection[] = [
    // 正在追番
    {
        id: 1,
        user_id: 1,
        anime_id: 5,
        progress: 12,
        rating: 4.5,
        created_at: '2026-01-04T08:00:00',
        updated_at: '2026-03-19T22:10:00',
        anime: mockAnimes[4] // 迷宫饭
    },
    {
        id: 2,
        user_id: 1,
        anime_id: 11,
        progress: 15,
        rating: 4.3,
        created_at: '2026-01-05T09:30:00',
        updated_at: '2026-03-18T19:45:00',
        anime: mockAnimes.find(a => a.id === 11) // 转生史莱姆
    },
    {
        id: 3,
        user_id: 1,
        anime_id: 14,
        progress: 8,
        rating: 4.0,
        created_at: '2026-01-07T10:15:00',
        updated_at: '2026-03-17T20:30:00',
        anime: mockAnimes.find(a => a.id === 14) // 实吉同学
    },
    // 已看完的番剧
    {
        id: 4,
        user_id: 1,
        anime_id: 1,
        progress: 28,
        rating: 4.9,
        created_at: '2022-10-01T12:00:00',
        updated_at: '2023-03-15T18:20:00',
        anime: mockAnimes[0] // 葬送的芙莉莲
    },
    {
        id: 5,
        user_id: 1,
        anime_id: 2,
        progress: 12,
        rating: 4.8,
        created_at: '2022-11-01T14:00:00',
        updated_at: '2022-12-25T15:10:00',
        anime: mockAnimes[1] // 孤独摇滚
    },
    {
        id: 6,
        user_id: 1,
        anime_id: 3,
        progress: 23,
        rating: 4.5,
        created_at: '2023-07-06T16:30:00',
        updated_at: '2023-10-10T20:45:00',
        anime: mockAnimes[2] // 咒术回战
    },
    {
        id: 7,
        user_id: 1,
        anime_id: 6,
        progress: 25,
        rating: 4.9,
        created_at: '2020-04-06T10:00:00',
        updated_at: '2020-09-20T22:30:00',
        anime: mockAnimes[4] // 排球少年
    }
];

// --- 辅助函数：判断是否在追 ---
export const isWatching = (collection: Collection): boolean => {
    return collection.anime ? collection.progress < collection.anime.total_episodes : false;
};

// --- 辅助函数：获取用户的追番和已完成的番剧 ---
export const getWatchingAndCompleted = (collections: Collection[]) => {
    const watching = collections.filter(c => isWatching(c));
    const completed = collections.filter(c => !isWatching(c));
    return { watching, completed };
};
