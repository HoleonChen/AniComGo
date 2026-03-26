-- AniComGo 数据库初始化脚本
-- 如果你的数据库是在旧版本脚本基础上创建的，请额外执行：
-- ALTER TABLE animes ADD COLUMN tags VARCHAR(255) NULL COMMENT '番剧标签，建议逗号分隔';
-- ALTER TABLE animes ADD COLUMN studios VARCHAR(255) NULL COMMENT '制作公司，建议逗号分隔';
-- ALTER TABLE animes ADD COLUMN rating DECIMAL(2,1) NULL COMMENT '番剧综合评分';
-- CREATE TABLE comment_likes (...); 旧库请参考下方完整建表语句补齐评论点赞表。

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    bio VARCHAR(300) NULL,
    role TINYINT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT chk_users_role CHECK (role IN (0, 1)),
    CONSTRAINT chk_users_status CHECK (status IN (0, 1))
);

CREATE TABLE IF NOT EXISTS animes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    poster_url VARCHAR(500) NULL,
    tags VARCHAR(255) NULL,
    studios VARCHAR(255) NULL,
    rating DECIMAL(2,1) NULL,
    total_episodes INT NULL,
    release_date DATE NULL,
    description VARCHAR(1000) NULL,
    status TINYINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_animes_status CHECK (status IN (1, 2)),
    CONSTRAINT chk_animes_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5.0)),
    CONSTRAINT chk_animes_total_episodes CHECK (total_episodes IS NULL OR total_episodes >= 0)
);

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    anime_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    content VARCHAR(1000) NOT NULL,
    likes_count INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_comments_anime FOREIGN KEY (anime_id) REFERENCES animes(id),
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id),
    CONSTRAINT chk_comments_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_comments_likes CHECK (likes_count >= 0)
);

CREATE TABLE IF NOT EXISTS comment_likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    comment_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES comments(id),
    CONSTRAINT uk_comment_likes_user_comment UNIQUE (user_id, comment_id)
);

CREATE TABLE IF NOT EXISTS collections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    anime_id BIGINT NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    rating INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_collections_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_collections_anime FOREIGN KEY (anime_id) REFERENCES animes(id),
    CONSTRAINT uk_collections_user_anime UNIQUE (user_id, anime_id),
    CONSTRAINT chk_collections_progress CHECK (progress >= 0),
    CONSTRAINT chk_collections_rating CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_comments_anime_id ON comments(anime_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_anime_id ON collections(anime_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_animes_status ON animes(status);
