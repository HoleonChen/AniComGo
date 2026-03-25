import React from 'react';
import { Card, Progress, Tag, theme } from 'antd';
import AnimeCard from './AnimeCard';

export type AnimeCardProgressProps = {
    title: string;
    poster: string;
    rating: number;
    tags: string[];
    updateInfo: string;
    userRating?: number; // 用户评分可选
    mode?: 'watching' | 'completed' | 'none';
    progress?: number;
    totalEpisodes?: number;
    onCardClick?: () => void; // Renamed to ensure uniqueness
};

const AnimeCardProgress: React.FC<AnimeCardProgressProps> = ({
                                                                 title,
                                                                 poster,
                                                                 rating,
                                                                 tags,
                                                                 updateInfo,
                                                                 userRating,
                                                                 mode,
                                                                 progress = 0,
                                                                 totalEpisodes = 1,
                                                                 onCardClick, 
                                                             }) => {
    const { token } = theme.useToken();

    const safeTotal = Math.max(totalEpisodes, 1);
    const percent = Math.round((progress / safeTotal) * 100);

    return (
        <Card
            onClick={onCardClick} // Use onCardClick
            hoverable={!!onCardClick} // Add hover effect
            style={{ 
                borderRadius: '12px', 
                overflow: 'hidden',
                cursor: onCardClick ? 'pointer' : 'default' // Add cursor styles
            }}
            bodyStyle={{ padding: '12px' }}
            cover={
                <div style={{ position: 'relative' }}>
                    <AnimeCard
                        title={title}
                        poster={poster}
                        rating={rating}
                        tags={tags}
                        updateInfo={updateInfo}
                    />

                    {mode === 'watching' ? (
                        <div style={{ padding: '8px' }}>
                            <div
                                style={{
                                    fontSize: '12px',
                                    marginBottom: '4px',
                                    color: token.colorTextDescription,
                                }}
                            >
                                进度: {progress}/{safeTotal}
                            </div>
                            <Progress
                                percent={percent}
                                size="small"
                                strokeColor={token.colorPrimary}
                            />
                        </div>
                    ) : mode === 'completed' ? (
                        <div style={{ padding: '8px' }}>
                            <Tag color="success" style={{ width: '100%', textAlign: 'center' }}>
                                ✓ 已完成
                            </Tag>
                        </div>
                    ) : null}

                    {userRating !== undefined && (
                        <div style={{ padding: '0 8px 8px 8px', fontSize: '12px' }}>
                            <span style={{ color: token.colorTextDescription }}>你的评分: </span>
                            <span style={{ color: token.colorWarning, fontWeight: 'bold' }}>
                                {userRating}/5 ⭐
                            </span>
                        </div>
                    )}
                </div>
            }
        />
    );
};

export default AnimeCardProgress;
