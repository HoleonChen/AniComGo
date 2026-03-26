import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Row, Col, Card, Tag, Rate, Breadcrumb, List, Avatar, Divider, theme, Descriptions, Button, Input, Space, Modal, message, Spin } from 'antd';
import { UserOutlined, LikeOutlined, LikeFilled, MessageOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { type Comment, type Anime, type Collection, getRatingLevel } from '../data/Model';
import animeService from '../services/animeService';
import userService from '../services/userService'; // Import userService
import commentService from '../services/commentService'; // Import commentService
import { useAuth } from '../context/AuthContext';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const AnimeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { user, openLoginModal } = useAuth(); // Get current user & modal
    const [anime, setAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(true);
    const [collection, setCollection] = useState<Collection | null>(null); // Track user collection status

    // Comments data
    const [comments, setComments] = useState<Comment[]>([]);
    
    // Pagination and reply state
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const loadAnimeData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Parallel fetch for anime detail and user context (if logged in)
            const [animeData] = await Promise.all([
               animeService.getAnimeById(Number(id)),
            ]);

            if (animeData) {
                setAnime(animeData);
                
                // Fetch Collection Status if logged in
                if (user) {
                    try {
                        // Fetch collections filtering by this anime ID
                        // Note: Assuming getCollections supports filtering or returns small enough list to find it
                        const myCollections = await userService.getCollections(1, 100, Number(id)); // Pass animeID
                        const found = myCollections.find(c => c.anime_id === Number(id));
                        if (found) {
                            setCollection(found);
                        }
                    } catch (e) {
                        console.error("Failed to check collection status", e);
                    }
                }

                // Fetch Comments
                try {
                    const commentData = await commentService.getComments(1, 100, Number(id));
                    let loadedComments = commentData.list;

                    // If user is logged in, fetch like-status for each comment
                    if (user && loadedComments.length > 0) {
                        loadedComments = await Promise.all(loadedComments.map(async (c) => {
                            const status = await commentService.getCommentLikeStatus(c.id);
                            return {
                                ...c,
                                isLiked: status.liked || false,
                                likes_count: status.likesCount !== undefined ? status.likesCount : c.likes_count,
                            };
                        }));
                    }
                    setComments(loadedComments);
                } catch (e) {
                     console.error("Failed to load comments", e);
                }

            } else {
                message.error('番剧不存在');
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to fetch anime detail', error);
            message.error('加载失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnimeData();
    }, [id, navigate, user]); // Re-run if user logs in


    const handleReply = (commentId: number) => {
        if (replyingTo === commentId) {
            setReplyingTo(null);
            setReplyContent('');
        } else {
            setReplyingTo(commentId);
            setReplyContent('');
        }
    };

    const submitReply = async (parentId: number | null) => {
        if (!user) {
            message.warning('请先登录');
            return;
        }
        if (!replyContent.trim()) {
            message.warning('请输入回复内容');
            return;
        }
        if (!anime) return;
        
        try {
            const success = await commentService.addComment(anime.id, replyContent, parentId || undefined);
            if (success) {
                message.success('回复成功');
                setReplyContent('');
                setReplyingTo(null);
                // Refresh comments
                const commentData = await commentService.getComments(1, 100, anime.id);
                let loadedComments = commentData.list;
                if (user && loadedComments.length > 0) {
                    loadedComments = await Promise.all(loadedComments.map(async (c) => {
                        const status = await commentService.getCommentLikeStatus(c.id);
                        return {
                            ...c,
                            isLiked: status.liked || false,
                            likes_count: status.likesCount !== undefined ? status.likesCount : c.likes_count,
                        };
                    }));
                }
                setComments(loadedComments);
            } else {
                message.error('回复失败');
            }
        } catch(e) {
             message.error('回复失败');
        }
    };
    
    const handleLike = async (commentId: number) => {
        if (!user) {
            message.warning('请先登录');
            return;
        }

        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        try {
            let result;
            if (comment.isLiked) {
                result = await commentService.unlikeComment(commentId);
            } else {
                result = await commentService.likeComment(commentId);
            }

            if (result.likesCount !== undefined && result.liked !== undefined) {
                setComments(prev => prev.map(c => 
                    c.id === commentId ? { ...c, likes_count: result.likesCount!, isLiked: result.liked } : c
                ));
            } else {
                 message.error(comment.isLiked ? '取消点赞失败' : '点赞失败');
            }
        } catch (error) {
             message.error('操作失败');
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!anime) return null;

    const levelInfo = getRatingLevel(anime.rating);

    const handleFollowClick = async () => {
        if (!user) {
             openLoginModal();
             return;
        }

        if (collection) {
            Modal.confirm({
                title: '你确认要取消追番吗？',
                onOk: async () => {
                   const success = await userService.removeCollection(collection.id);
                   if (success) {
                       setCollection(null);
                       message.success('已取消追番');
                   } else {
                       message.error('操作失败');
                   }
                }
            });
        } else {
            const success = await userService.addCollection(anime.id);
            if (success) {
                // Refresh to get ID
                try {
                     const myCollections = await userService.getCollections(1, 100, anime.id);
                     const found = myCollections.find(c => c.anime_id === anime.id);
                     if (found) setCollection(found);
                     message.success('已加入追番列表');
                } catch(e) {
                    // Fallback mock check passing
                    setCollection({ id: 0, anime_id: anime.id, user_id: user.id || 0, progress: 0, rating: 0, created_at: '', updated_at: '' });
                }
            } else {
                message.error('操作失败');
            }
        }
    };

    const handleRateChange = async (value: number) => {
        if (!user) {
             openLoginModal();
             return;
        }
        if (!collection) {
              message.warning('请先加入追番列表后再评分');
              return;
        }
        
        Modal.confirm({
            title: `确定给这部番剧 ${value} 分吗？`,
            content: '这也将同步更新您的观看进度状态。', // Or just confirm
            onOk: async () => {
                const success = await userService.updateCollection(collection.id, {
                    animeId: anime.id,
                    rating: value,
                    progress: collection.progress // Keep progress same
                });
                
                if (success) {
                    message.success('评分成功');
                    setCollection({ ...collection, rating: value });
                } else {
                    message.error('评分失败');
                }
            }
        });
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

                        {/* 按钮操作区 */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={collection ? <CheckOutlined /> : <PlusOutlined />}
                                onClick={handleFollowClick}
                                style={{ 
                                    minWidth: '140px',
                                    height: '48px',
                                    borderRadius: '24px',
                                    fontSize: '16px',
                                    boxShadow: '0 4px 15px rgba(255, 103, 154, 0.3)'
                                }}
                            >
                                {collection ? '已追番' : '追番'}
                            </Button>
                            
                            {/* Rating Button with Popover or just inline if cleaner */}
                             <div style={{ display: 'flex', alignItems: 'center', background: token.colorBgContainer, padding: '0 16px', borderRadius: '24px', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <span style={{ marginRight: '8px', color: token.colorTextSecondary }}>我的评分:</span>
                                <Rate value={collection?.rating || 0} onChange={handleRateChange} disabled={!collection} />
                             </div>
                        </div>

                        {/* 剧情简介 */}
                        <section style={{ marginBottom: '32px' }}>
                            <Title level={3}>简介</Title>
                            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                                {anime.description}
                                <br /><br />
                                (这里是模拟的更多剧情文本) 故事发生在一个充满奇幻色彩的世界中，名为“艾尔利亚”的大陆上，人类与各种神奇生物共存。主角原本是一个普通的少年，直到有一天他发现了自己隐藏的魔法天赋...
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
                                    <Avatar size="large" icon={<UserOutlined />} src={user?.avatar_url} style={{ backgroundColor: token.colorPrimary }} />
                                    <div style={{ flex: 1 }}>
                                        <TextArea
                                            rows={4}
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            placeholder={user ? (collection ? "发条评论吐槽一下吧..." : "收藏番剧后即可发表评论~") : "登录后参与讨论..."}
                                            style={{ marginBottom: '16px', borderRadius: '8px', resize: 'none' }}
                                            disabled={!user || !collection} 
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                type="primary" 
                                                icon={<MessageOutlined />}
                                                onClick={() => submitReply(null)} // No parent
                                                disabled={!user || !replyContent.trim()}
                                                loading={loading}
                                            >
                                                发表评论
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* 评论列表 */}
                            <List
                                itemLayout="vertical"
                                dataSource={comments}
                                locale={{ emptyText: '还没有人评论，来抢沙发吧！' }}
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
                                                <Space key="list-vertical-like-o" onClick={() => handleLike(item.id)} style={{ cursor: 'pointer', color: item.isLiked ? token.colorPrimary : 'inherit' }}>
                                                    {item.isLiked ? <LikeFilled /> : <LikeOutlined />}
                                                    {item.likes_count}
                                                </Space>,
                                                <span key="reply" onClick={() => handleReply(item.id)} style={{ cursor: 'pointer' }}>
                                                    回复
                                                </span>,
                                                user?.role === 1 && <span key="audit-status" style={{ fontSize: '12px', color: item.status === 1 ? 'green' : 'red' }}>
                                                {item.status === 1 ? '已通过' : '待审核/拒绝'}
                                            </span>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar src={item.user?.avatar} icon={<UserOutlined />} />}
                                                title={
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{item.user?.username || '用户' + item.user_id}</span>
                                                        <span style={{ fontSize: '12px', color: token.colorTextSecondary }}>
                                                            {new Date(item.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                }
                                                description={null}
                                            />
                                            <Paragraph 
                                                ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                                                style={{ margin: 0, fontSize: '15px' }}
                                            >
                                                {item.content}
                                            </Paragraph>
                                            
                                            {/* Reply Input Area if replying to this comment */}
                                            {replyingTo === item.id && (
                                                <div style={{ marginTop: '16px', padding: '16px', background: token.colorFillAlter, borderRadius: '8px' }}>
                                                    <TextArea
                                                        rows={2}
                                                        value={replyContent}
                                                        onChange={e => setReplyContent(e.target.value)}
                                                        placeholder={`回复 @${item.user?.username}...`}
                                                        style={{ marginBottom: '8px' }}
                                                        autoFocus
                                                    />
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Button size="small" style={{ marginRight: '8px' }} onClick={() => setReplyingTo(null)}>取消</Button>
                                                        <Button type="primary" size="small" onClick={() => submitReply(item.id)}>回复</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </List.Item>
                                    </div>
                                )}
                            />
                        </section>
                    </Col>

                    {/* 右侧边栏 (30% - 25%) */}
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
                                    style={collection ? { backgroundColor: '#d9d9d9', borderColor: '#d9d9d9', color: 'rgba(0, 0, 0, 0.45)' } : {}}
                                >
                                    {collection ? '已追番' : '加入追番列表'}
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

