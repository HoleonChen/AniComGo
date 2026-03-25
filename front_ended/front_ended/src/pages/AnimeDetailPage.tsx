import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Row, Col, Card, Tag, Rate, Breadcrumb, List, Avatar, Divider, theme, Descriptions, Button, Input, Space, Tooltip, Modal, message, Pagination } from 'antd';
import { UserOutlined, LikeOutlined, LikeFilled, MessageOutlined } from '@ant-design/icons';
import { mockAnimes, mockComments, mockUserCollections } from '../data/mockData';
import { type Comment, getRatingLevel } from '../data/Model';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const AnimeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [anime, setAnime] = useState(mockAnimes.find(a => a.id === Number(id)) || mockAnimes[0]);
    const [isFollowed, setIsFollowed] = useState(false);

    // Mock comments data structure based on provided schema
    const [comments, setComments] = useState<Comment[]>([]);
    
    // Pagination and reply state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        // Check if anime is in watchlist
        const found = mockUserCollections.find(c => c.anime_id === Number(id));
        setIsFollowed(!!found);

        // Load comments for this anime (simulated)
        // In real app, this would be an API call filtered by anime_id
        // For mock, we just filter the static mockComments or just show all if we only have sample data
        // Let's filter by anime_id if possible, but our mockComments currently are hardcoded for anime 1.
        // Let's just use mockComments for simplicity, or filter if we added IDs.
        // The mockComments in mockData.ts has anime_id: 1. Let's make it generic or filter it.
        // If current anime.id matches, show them.
        
        const animeId = Number(id);
        const filteredComments = mockComments.filter(c => c.anime_id === animeId);
        
        // If no comments found for this anime (e.g. other than id=1), we can either show empty 
        // or just show all mock comments for demo purposes if desired. 
        // Given this is a prototype, I'll default to showing all mockComments if filtered is empty 
        // to ensure the UI is populated for review, or better, just use all mockComments.
        // Let's stick to filtering to be realistic, but if empty, maybe show the demo ones?
        // Let's just use mockComments for now as the user asked to move "this page's mock data".
        
        if (filteredComments.length > 0) {
            setComments(filteredComments);
        } else {
             // Fallback for demo: show comments even if ID doesn't match, so every page has comments
             setComments(mockComments);
        }
    }, [id]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleReply = (commentId: number) => {
        if (replyingTo === commentId) {
            setReplyingTo(null);
            setReplyContent('');
        } else {
            setReplyingTo(commentId);
            setReplyContent('');
        }
    };

    const submitReply = (parentId: number) => {
        if (!replyContent.trim()) {
            message.warning('请输入回复内容');
            return;
        }
        
        const newComment: Comment = {
            id: Date.now(),
            user_id: 1, // Mock current user
            anime_id: anime.id,
            parent_id: parentId,
            content: replyContent,
            likes_count: 0,
            status: 1,
            created_at: new Date().toLocaleString(),
            updated_at: new Date().toLocaleString(),
            user: {
                username: 'CurrentUser',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser'
            },
            isLiked: false
        };

        // Add to mock data (simulating backend)
        mockComments.unshift(newComment);
        
        // Update local state - keeping it simple for now (just appending to top)
        // In a real app with pagination, this might go to the end or require a re-fetch.
        // For replies, usually they are nested. Here we are just adding to the list.
        // If we want nested, we need to restructure. But for "reply functionality" in a flat list context:
        // We will just add it.
        const newComments = [newComment, ...comments];
        setComments(newComments);
        
        setReplyingTo(null);
        setReplyContent('');
        message.success('回复成功');
    };
    
    const handleLike = (commentId: number) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const newIsLiked = !c.isLiked;
                return {
                    ...c,
                    isLiked: newIsLiked,
                    likes_count: c.likes_count + (newIsLiked ? 1 : -1)
                };
            }
            return c;
        }));
    };

    useEffect(() => {
        const found = mockAnimes.find(a => a.id === Number(id));
        if (found) {
            setAnime(found);
        }
        window.scrollTo(0, 0);
    }, [id]);

    if (!anime) return null;

    const levelInfo = getRatingLevel(anime.rating);

    const handleFollowClick = () => {
        if (isFollowed) {
            Modal.confirm({
                title: '你确认要取消追番吗？',
                onOk: () => {
                    // Logic to remove from mockUserCollections
                    const index = mockUserCollections.findIndex(c => c.anime_id === anime.id);
                    if (index > -1) {
                        mockUserCollections.splice(index, 1);
                        setIsFollowed(false);
                        message.success('已取消追番');
                    }
                }
            });
        } else {
            // Logic to add to mockUserCollections
            mockUserCollections.push({
                id: Date.now(),
                user_id: 1, // Mock user ID
                anime_id: anime.id,
                progress: 0,
                rating: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                anime: anime // Include the anime object for display purposes in WatchListPage
            });
            setIsFollowed(true);
            message.success('已加入追番列表');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Dynamic Background Layer */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: token.colorBgLayout }}>
                {/* Single Blurred Background Image */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${anime.poster_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(20px) brightness(0.8)',
                    opacity: 0.5,
                    transform: 'scale(1.1)', // Slightly scale up to hide blur edges
                }} />
                
                {/* Global Overlay to ensure text readability */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to bottom, ${token.colorBgLayout} 0%, transparent 20%, transparent 80%, ${token.colorBgLayout} 100%)`, 
                    opacity: 0.8
                }} />
            </div>

            <Content style={{ position: 'relative', zIndex: 1, padding: '80px 24px 40px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                {/* 面包屑导航 */}
                <Breadcrumb
                    style={{ marginBottom: '16px' }}
                    items={[
                        { title: <a onClick={() => navigate('/')}>主页</a> },
                        { title: <a onClick={() => navigate('/season')}>季度</a> },
                        { title: anime.title },
                    ]}
                />

                <Row gutter={[32, 32]}>
                    {/* 左侧主要内容区域 (70% - 75%) */}
                    <Col xs={24} md={16} lg={17}>
                        {/* 标题区 */}
                        <div style={{ marginBottom: '24px', borderBottom: `1px solid ${token.colorBorderSecondary}`, paddingBottom: '16px' }}>
                            <Title level={1} style={{ marginBottom: '8px' }}>{anime.title}</Title>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Rate disabled allowHalf value={anime.rating} style={{ fontSize: '16px', color: '#faad14' }} />
                                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{anime.rating}</span>
                                <Divider type="vertical" />
                                <span>{anime.type || 'TV'}</span>
                                <Divider type="vertical" />
                                <span>{anime.release_date.split('-')[0]}</span>
                            </div>
                        </div>

                        {/* 剧情简介 */}
                        <section style={{ marginBottom: '32px' }}>
                            <Title level={3}>简介</Title>
                            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                                {anime.description}
                                <br /><br />
                                (这里是模拟的更多剧情文本) 故���发生在一个充满奇幻色彩的世界中，名为“艾尔利亚”的大陆上，人类与各种神奇生物共存。主角原本是一个普通的少年，直到有一天他发现了自己隐藏的魔法天赋...
                                随着冒险的深入，通过无数次的战斗与羁绊，主角逐渐揭开了关于世界起源的惊人秘密。
                            </Paragraph>
                        </section>

                        {/* 角色介绍 */}
                        {anime.characters && anime.characters.length > 0 && (
                            <section style={{ marginBottom: '32px' }}>
                                <Title level={3}>角色</Title>
                                <div style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    gap: '16px',
                                    paddingBottom: '16px', // Space for scrollbar
                                    scrollbarWidth: 'thin',
                                }}
                                className="hidden-scrollbar" // Optional: if you want to use CSS class for more styling
                                >
                                    {anime.characters.map((char) => (
                                        <div key={char.id} style={{ flex: '0 0 auto', width: '140px' }}>
                                            <Card
                                                hoverable
                                                bordered={false}
                                                style={{ background: token.colorBgContainer, height: '100%' }}
                                                bodyStyle={{ padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                            >
                                                <Avatar src={char.avatar_url} size={80} style={{ marginBottom: '12px' }} />
                                                <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {char.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: token.colorTextSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                                    {char.description}
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 声优介绍 */}
                        {anime.voice_actors && anime.voice_actors.length > 0 && (
                            <section style={{ marginBottom: '32px' }}>
                                <Title level={3}>声优</Title>
                                <div style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    gap: '16px',
                                    paddingBottom: '16px',
                                    scrollbarWidth: 'thin',
                                }}
                                className="hidden-scrollbar"
                                >
                                    {anime.voice_actors.map((actor) => (
                                        <div key={actor.id} style={{ flex: '0 0 auto', width: '140px' }}>
                                            <Card
                                                hoverable
                                                bordered={false}
                                                style={{ background: token.colorBgContainer, height: '100%' }}
                                                bodyStyle={{ padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                            >
                                                <Avatar src={actor.avatar_url} size={80} style={{ marginBottom: '12px' }} />
                                                <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {actor.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>CV</div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 评论区 (Comments) */}
                        <section style={{ marginBottom: '32px' }}>
                            <Title level={3}>评论区 ({comments.length})</Title>
                            
                            {/* 输入框区域 */}
                            <Card bordered={false} style={{ marginBottom: '24px', background: token.colorBgContainer, padding: '16px' }} bodyStyle={{ padding: 0 }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <Avatar size="large" icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                             <span style={{ fontWeight: 500 }}>为你心爱的动漫打分吧:</span>
                                             <Rate allowHalf defaultValue={0} />
                                        </div>
                                        <TextArea 
                                            rows={4} 
                                            placeholder="这个评论区需要一条神一样的发言..."
                                            style={{ marginBottom: '12px', resize: 'none' }} 
                                        />
                                        <div style={{ textAlign: 'right' }}>
                                            <Button type="primary" size="large">
                                                发表评论
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* 评论列表 */}
                            <List
                                itemLayout="vertical"
                                dataSource={comments.filter(c => !c.parent_id).slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                                renderItem={(item) => (
                                    <div key={item.id}>
                                        <List.Item
                                            style={{ 
                                                background: token.colorBgContainer, 
                                                marginTop: '16px',
                                                padding: '24px',
                                                borderRadius: '12px'
                                            }}
                                            actions={[
                                                <Tooltip title="Like">
                                                    <span onClick={() => handleLike(item.id)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        {React.createElement(item.isLiked ? LikeFilled : LikeOutlined)}
                                                        <span>{item.likes_count}</span>
                                                    </span>
                                                </Tooltip>,
                                                <span onClick={() => handleReply(item.id)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <MessageOutlined />
                                                    <span>{replyingTo === item.id ? '取消回复' : '回复'}</span>
                                                </span>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar src={item.user?.avatar} size="large" />}
                                                title={
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Space direction="vertical" size={2}>
                                                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.user?.username}</span>
                                                            <span style={{ color: token.colorTextSecondary, fontSize: '12px' }}>{item.created_at}</span>
                                                        </Space>
                                                    </div>
                                                }
                                                description={
                                                    <Paragraph style={{ marginTop: '12px', marginBottom: 0, fontSize: '15px', color: token.colorText }}>
                                                        {item.content}
                                                    </Paragraph>
                                                }
                                            />
                                        </List.Item>

                                        {/* Reply Input Box */}
                                        {replyingTo === item.id && (
                                            <div style={{ 
                                                marginLeft: '48px', 
                                                marginTop: '12px', 
                                                padding: '16px', 
                                                background: token.colorFillAlter, 
                                                borderRadius: '8px' 
                                            }}>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <Input.TextArea 
                                                        rows={2} 
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder={`回复 @${item.user?.username}...`}
                                                        style={{ resize: 'none' }}
                                                    />
                                                    <Button type="primary" onClick={() => submitReply(item.id)} style={{ alignSelf: 'flex-end' }}>
                                                        发送
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Show replies (nested comments) if exist in the current page view - simplified for now */}
                                        {/* Real implementation would recursively render or filter comments where parent_id === item.id */}
                                        {comments.filter(c => c.parent_id === item.id).map(reply => (
                                             <div key={reply.id} style={{ marginLeft: '48px', marginTop: '8px', padding: '16px', background: token.colorFillQuaternary, borderRadius: '8px' }}>
                                                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                     <Avatar src={reply.user?.avatar} size="small" />
                                                     <div>
                                                         <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{reply.user?.username} <span style={{ fontWeight: 'normal', color: token.colorTextSecondary, fontSize: '12px' }}>{reply.created_at}</span></div>
                                                         <div style={{ marginTop: '4px' }}>{reply.content}</div>
                                                     </div>
                                                 </div>
                                             </div>
                                        ))}
                                    </div>
                                )}
                            />
                            
                            {/* Pagination */}
                            {comments.filter(c => !c.parent_id).length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={comments.filter(c => !c.parent_id).length}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}

                        </section>

                    </Col>

                    {/* 右侧信息侧边栏 (Sidebar / InfoBox) (30% - 25%) */}
                    <Col xs={24} md={8} lg={7}>
                        <Card
                            bordered
                            style={{
                                position: 'sticky',
                                top: '100px', // Sticky sidebar
                                borderColor: token.colorBorderSecondary,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                            bodyStyle={{ padding: '0' }}
                        >
                            {/* 海报 */}
                            <div style={{ padding: '16px', background: token.colorBgLayout, textAlign: 'center' }}>
                                <img
                                    src={anime.poster_url}
                                    alt={anime.title}
                                    style={{
                                        width: '100%',
                                        maxWidth: '240px',
                                        borderRadius: '4px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </div>

                            {/* Info Table */}
                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                                labelStyle={{ width: '100px', background: token.colorBgLayout, fontWeight: 500 }}
                            >
                                <Descriptions.Item label="动画名称">{anime.title}</Descriptions.Item>
                                <Descriptions.Item label="类型">{anime.type || 'TV'}</Descriptions.Item>
                                <Descriptions.Item label="话数">{anime.total_episodes}</Descriptions.Item>
                                <Descriptions.Item label="状态">{anime.status === 2 ? '已完结' : '连载中'}</Descriptions.Item>
                                <Descriptions.Item label="首映于">{anime.release_date}</Descriptions.Item>
                                <Descriptions.Item label="工作室">
                                    {anime.studios.map(s => s.name).join(', ')}
                                </Descriptions.Item>
                                <Descriptions.Item label="分类">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {anime.tags.map(tag => (
                                            <Tag key={tag.id} bordered={false} color="magenta" style={{ fontSize: '11px', margin: 0 }}>
                                                {tag.name}
                                            </Tag>
                                        ))}
                                    </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="评分">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#faad14' }}>{anime.rating}</span>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: levelInfo.color, textShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>{levelInfo.text}</span>
                                    </div>
                                </Descriptions.Item>
                            </Descriptions>
                            
                            <div style={{ padding: '16px' }}>
                                <Button 
                                    type="primary" 
                                    block 
                                    size="large"
                                    onClick={handleFollowClick}
                                    style={isFollowed ? { backgroundColor: '#d9d9d9', borderColor: '#d9d9d9', color: 'rgba(0, 0, 0, 0.45)' } : {}}
                                >
                                    {isFollowed ? '已追番' : '加入追番列表'}
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default AnimeDetailPage;

