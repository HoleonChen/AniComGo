import React, { useState } from 'react';
import { theme, Badge, Tag, Rate, Typography } from 'antd'; // 引入 AntD 主题钩子


const { Text } = Typography;

interface AnimeCardProps {
    title: string;
    poster: string;
    rating: number;
    tags: string[];
    updateInfo: string;
    onClick?: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ title, poster, rating, tags, updateInfo, onClick }) => {
    // 获取当前主题的变量
    const { token } = theme.useToken();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            style={{
                // 动态背景：暗色时是深灰，亮色时是纯白
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                height: '100%',
                minWidth: '160px', // 设置最小宽度，保证内容不被挤压，保持海报比例3:4
                maxWidth: '260px', // 设置最大宽度，防止卡片过大
                margin: '0 auto', // 居中显示
                // 动态阴影：亮色时更柔和
                boxShadow: isHovered ? token.boxShadow : token.boxShadowTertiary,
                border: `1px solid ${token.colorBorderSecondary}`, // 亮色模式下淡淡的边框增加质感
                transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
            }}
            // 鼠标悬停交互
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 海报部分 */}
            <div style={{
                width: '100%',
                aspectRatio: '3 / 4',
                overflow: 'hidden',
                backgroundColor: token.colorFillTertiary, // 图片未加载时的占位色
                position: 'relative'
            }}>
                <img
                    src={poster}
                    alt={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                />



                <Badge
                    count={updateInfo}
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        borderRadius: '4px',
                        boxShadow: 'none',
                        zIndex: 2,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            </div>

            {/* 信息部分 */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* 左侧彩色竖条：使用品牌主色 */}
                    <div style={{
                        width: '4px',
                        height: '18px',
                        backgroundColor: token.colorPrimary,
                        borderRadius: '2px',
                        marginRight: '8px',
                        flexShrink: 0
                    }} />

                    {/* 作品名称：自动适配黑/白文字 */}
                    <Text
                        ellipsis={{ tooltip: title }}
                        style={{
                            color: token.colorText,
                            fontSize: '15px',
                            fontWeight: 600,
                            flex: 1
                        }}
                    >
                        {title}
                    </Text>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {tags.map(tag => (
                        <Tag key={tag} bordered={false} color="magenta" style={{ fontSize: '10px', borderRadius: '4px', margin: 0, lineHeight: '18px', opacity: 0.85 }}>
                            {tag}
                        </Tag>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', flexWrap: 'nowrap' }}>
                    <Rate disabled allowHalf defaultValue={rating} count={5} style={{ fontSize: '12px', color: '#ffec3d', minWidth: '90px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#faad14', fontFamily: 'Monaco, monospace', flexShrink: 0, marginLeft: '4px' }}>{rating.toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
};

export default AnimeCard;