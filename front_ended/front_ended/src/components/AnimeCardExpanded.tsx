import React, { useMemo } from 'react';
import { Card, theme, Button, Typography, Rate, Tag } from 'antd'; // Removed unused Row, Col
import { PlayCircleOutlined } from '@ant-design/icons';
import type { Anime } from '../data/Model';
import { getRatingLevel } from '../data/Model';

const { Text, Paragraph, Title } = Typography;

interface AnimeCardExpandedProps {
    anime: Anime;
    progress: number; // 当前用户观看的集数
    onUpdateProgress?: (newProgress: number) => void;
    onClick?: () => void; // Add onClick handler
}

const AnimeCardExpanded: React.FC<AnimeCardExpandedProps> = ({
                                                                 anime,
                                                                 progress,
                                                                 onUpdateProgress,
                                                                 onClick // Destructure onClick
                                                             }) => {
    const { token } = theme.useToken();

    // 模拟获取“当前更新进度”
    // 根据 animeUtils 中的 getUpdateInfo 逻辑反推:
    // if (anime.status === 2) return `全${anime.total_episodes}话`;
    // if (anime.status === 1) return `更新至第${Math.max(1, anime.total_episodes - 2)}话`;
    const currentUpdatedEpisode = useMemo(() => {
        if (anime.status === 2) return anime.total_episodes; // 已完结
        if (anime.status === 1) return Math.max(1, anime.total_episodes - 2); // 连载中模拟
        return 0; // 未开播
    }, [anime]);

    const handlePreviewNext = (e: React.MouseEvent) => {
        e.stopPropagation(); // Stop propagation to prevent card click
        if (onUpdateProgress) {
            onUpdateProgress(progress + 1);
        }
    };

    const displayRating = anime.rating;
    const levelInfo = getRatingLevel(displayRating);

    // 进度条计算
    const total = Math.max(anime.total_episodes, 1);
    const watchedPercent = Math.min((progress / total) * 100, 100);
    // 已放映但未观看 (绿色)
    // 范围是 [progress, currentUpdatedEpisode]
    // 长度 = (currentUpdatedEpisode - progress) / total
    const availableButNotWatchedCount = Math.max(0, currentUpdatedEpisode - progress);
    const availablePercent = (availableButNotWatchedCount / total) * 100;

    // 显示下一话按钮的条件:
    // 1. 已观看 < 当前更新 (还有得看)
    // 2. 已观看 < 总集数 (没看完)
    const showNextButton = progress < currentUpdatedEpisode && progress < anime.total_episodes;

    const nextEpisode = progress + 1;

    return (
        <Card
            onClick={onClick}
            hoverable // Add hover effect
            style={{
                borderRadius: '16px',
                overflow: 'hidden',
                // marginBottom: '24px', // 让父组件 Grid gap 控制间距
                boxShadow: token.boxShadowTertiary,
                background: token.colorBgContainer,
                height: '100%', // 撑满 Grid 卡片高度
                cursor: onClick ? 'pointer' : 'default' // Add cursor pointer
            }}
            bodyStyle={{ padding: '12px' }} // 减少 padding
        >
            <div style={{ display: 'flex', height: '160px' }}> {/* 减小高度 */}
                {/* 左侧：海报 */}
                <div style={{
                    height: '100%',
                    aspectRatio: '3/4',
                    flexShrink: 0,
                    marginRight: '16px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <img
                        src={anime.poster_url}
                        alt={anime.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>

                {/* 右侧：内容 */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {/* 上部分：标题和评分 */}
                    <div>
                        <Title level={4} style={{ marginBottom: '4px', marginTop: 0 }}> {/* 稍微改小标题等级或margin */}
                            {anime.title}
                        </Title>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                            {anime.tags.slice(0, 3).map((tag) => (
                                <Tag key={tag.id} bordered={false} color="magenta" style={{ fontSize: '10px', borderRadius: '4px', margin: 0, lineHeight: '18px', opacity: 0.85 }}>
                                    {tag.name}
                                </Tag>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}> {/* 减少间距 */}
                            <Rate disabled allowHalf value={displayRating} count={5} style={{ fontSize: '14px', color: '#ffec3d', marginRight: '6px' }} />
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14', fontFamily: 'Monaco, monospace', marginRight: '8px' }}>
                                {displayRating.toFixed(1)}
                            </span>
                            
                            {/* 评级 */}
                            <span style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: levelInfo.color,
                                textShadow: '0 1px 1px rgba(0,0,0,0.05)'
                            }}>
                                {levelInfo.text}
                            </span>
                        </div>
                    </div>

                    {/* 中部分：进度管理 */}
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '13px', flexShrink: 0 }}>
                            进度: <span style={{ color: token.colorText, fontWeight: 500 }}>{progress}</span> / {total}
                        </Text>

                        {/* 自定义进度条 */}
                        <div style={{
                            flex: 1,
                            maxWidth: '180px', // 稍微变短适应更小的卡片
                            height: '14px', // 稍微变细适应高度减少
                            backgroundColor: 'rgba(0,0,0,0.06)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            display: 'flex',
                            position: 'relative'
                        }}>
                            {/* Blue: 0 -> watched */}
                            <div style={{
                                width: `${watchedPercent}%`,
                                height: '100%',
                                backgroundColor: '#1890ff', // Blue
                                transition: 'width 0.3s ease'
                            }} />

                            {/* Green: watched -> currentUpdated */}
                            <div style={{
                                width: `${availablePercent}%`,
                                height: '100%',
                                backgroundColor: '#52c41a', // Green
                                transition: 'width 0.3s ease'
                            }} />
                        </div>

                        {showNextButton && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                onClick={handlePreviewNext} // Use updated handler
                                style={{ borderRadius: '16px', fontSize: '12px', flexShrink: 0 }}
                            >
                                已观看第{nextEpisode}话
                            </Button>
                        )}
                    </div>

                    {/* 下部分：简介 */}
                    <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{
                            color: token.colorTextDescription,
                            fontSize: '13px',
                            margin: 0,
                            lineHeight: '1.5'
                        }}
                    >
                        {anime.description}
                    </Paragraph>
                </div>
            </div>
        </Card>
    );
};

export default AnimeCardExpanded;

