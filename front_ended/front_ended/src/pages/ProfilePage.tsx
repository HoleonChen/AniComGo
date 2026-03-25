import React, { useState } from 'react';
import { Layout, Row, Col, theme, Avatar, Statistic, Tabs, Empty, Button, Upload, message } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { UserOutlined, FireOutlined, CheckCircleOutlined, LogoutOutlined, CameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimeCardProgress from '../components/AnimeCardProgress';
import { mockCurrentUser, mockUserCollections, getWatchingAndCompleted, getUpdateInfo } from '../data/mockData';
import heroImage from '../assets/background.jpg';

const { Content, Footer } = Layout;

const ProfilePage: React.FC = () => {
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const { isAuthenticated, openLoginModal, logout } = useAuth();
    const { watching, completed } = getWatchingAndCompleted(mockUserCollections);
    const [avatarUrl, setAvatarUrl] = useState(mockCurrentUser.avatar_url);

    const handleBeforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('只支持 JPG/PNG 格式!');
            return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('图片必须小于 2MB!');
            return Upload.LIST_IGNORE;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            setAvatarUrl(result);
            mockCurrentUser.avatar_url = result; // Update mock data for consistency in this session
            message.success('头像上传成功!');
        };

        return false; // Prevent default upload behavior
    };

    // 计算统计数据
    const totalWatched = mockUserCollections.length;
    const avgRating = (mockUserCollections.reduce((sum, c) => sum + c.rating, 0) / totalWatched).toFixed(1);
    const totalEpisodes = mockUserCollections.reduce((sum, c) => sum + c.progress, 0);

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent', position: 'relative' }}>
             {/* Split Background Layer */}
             <div style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'flex', background: token.colorBgLayout }}>
                 {/* Left Background */}
                 <div style={{
                     flex: 1,
                     backgroundImage: `url(${heroImage})`,
                     backgroundSize: 'auto 130%',
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'right center', // Changed from left to right to align to screen edge when flipped
                     transform: 'scaleX(-1)', // Mirror to create symmetry
                 }} />

                 {/* Center Seam Highlight */}
                 <div style={{
                     position: 'absolute',
                     left: '50%',
                     top: 0,
                     bottom: 0,
                     width: '65vw',
                     transform: 'translateX(-50%)',
                     background: `linear-gradient(to right, transparent 0%, ${token.colorBgBase} 20%, ${token.colorBgBase} 80%, transparent 100%)`,
                     opacity: 1,
                     zIndex: 1,
                     pointerEvents: 'none',
                 }} />

                 {/* Right Background (Mirrored) */}
                 <div style={{
                     flex: 1,
                     backgroundImage: `url(${heroImage})`,
                     backgroundSize: 'auto 130%',
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'right center', // Changed from left to right to align to screen edge
                     transform: 'scaleX(1)',
                 }} />
                
                {/* Optional dark overlay for better contrast if image is too bright, or to fit dark theme */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
            </div>

            <Content style={{
                padding: '112px 24px 40px 24px',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative', // Ensure content is above background
                zIndex: 1
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px'
                }}>
                    {!isAuthenticated ? (
                         <div style={{
                            backgroundColor: token.colorBgContainer,
                            borderRadius: '24px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            padding: '64px 32px',
                            textAlign: 'center',
                         }}>
                            <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: 24 }} />
                            <h2 style={{ marginBottom: 24 }}>请先登录</h2>
                            <Button type="primary" size="large" onClick={openLoginModal}>
                                立即登录 / 注册
                            </Button>
                         </div>
                    ) : (
                        <>
                            {/* 用户信息卡片 */}
                            <div style={{
                                backgroundColor: token.colorBgContainer,
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                padding: '32px',
                                marginBottom: '24px',
                                transition: 'all 0.3s',
                                position: 'relative' // Enable absolute positioning for children
                            }}>
                                <Button 
                                    type="primary" 
                                    icon={<LogoutOutlined />} 
                                    style={{ 
                                        position: 'absolute', 
                                        top: '32px', 
                                        right: '32px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 14px 0 rgba(255, 103, 154, 0.39)'
                                    }}
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                >
                                    退出登录
                                </Button>
                                <Row gutter={[32, 32]} align="middle">
                                    <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                                        <Upload
                                            name="avatar"
                                            showUploadList={false}
                                            beforeUpload={handleBeforeUpload}
                                            accept="image/png,image/jpeg"
                                        >
                                            <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} title="点击更换头像">
                                                <Avatar
                                                    size={120}
                                                    src={avatarUrl}
                                                    icon={<UserOutlined />}
                                                    style={{ 
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        border: `2px solid ${token.colorBgContainer}`
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor: token.colorPrimary,
                                                    color: '#fff',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                    border: `2px solid ${token.colorBgContainer}`
                                                }}>
                                                    <CameraOutlined />
                                                </div>
                                            </div>
                                        </Upload>
                                        <h2 style={{ margin: '16px 0 8px 0', color: token.colorTextHeading }}>
                                            {mockCurrentUser.username}
                                        </h2>
                                        <p style={{ color: token.colorTextDescription, margin: 0 }}>
                                            {mockCurrentUser.bio}
                                        </p>
                                    </Col>

                                    <Col xs={24} sm={16}>
                                        <Row gutter={[24, 24]}>
                                            <Col xs={12} sm={6}>
                                                <Statistic
                                                    title="追番中"
                                                    value={watching.length}
                                                    prefix={<FireOutlined />}
                                                    valueStyle={{ color: token.colorPrimary }}
                                                />
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <Statistic
                                                    title="已看完"
                                                    value={completed.length}
                                                    prefix={<CheckCircleOutlined />}
                                                    valueStyle={{ color: token.colorSuccess }}
                                                />
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <Statistic
                                                    title="平均评分"
                                                    value={avgRating}
                                                    suffix="/5"
                                                    valueStyle={{ color: token.colorWarning }}
                                                />
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <Statistic
                                                    title="看过集数"
                                                    value={totalEpisodes}
                                                    suffix="话"
                                                    valueStyle={{ color: token.colorInfo }}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>

                            {/* 收藏番剧区域 */}
                            <Tabs
                                defaultActiveKey="watching"
                                items={[
                                    {
                                        key: 'watching',
                                        label: `正在追番 (${watching.length})`,
                                        icon: <FireOutlined />,
                                        children: (
                                            <div style={{
                                                backgroundColor: token.colorBgContainer,
                                                borderRadius: '24px',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                                padding: '32px',
                                                marginTop: '16px'
                                            }}>
                                                {watching.length > 0 ? (
                                                    <Row gutter={[20, 24]}>
                                                        {watching.map((collection) => (
                                                            <Col
                                                                xs={24}
                                                                sm={12}
                                                                md={8}
                                                                lg={6}
                                                                xl={4}
                                                                xxl={4}
                                                                key={collection.id}
                                                            >
                                                                <AnimeCardProgress
                                                                    title={collection.anime?.title || ''}
                                                                    poster={collection.anime?.poster_url || ''}
                                                                    rating={collection.anime?.rating || 0}
                                                                    tags={collection.anime?.tags.map(t => t.name) || []}
                                                                    updateInfo={getUpdateInfo(collection.anime!)}
                                                                    userRating={collection.rating}
                                                                    mode="watching"
                                                                    progress={collection.progress}
                                                                    totalEpisodes={collection.anime?.total_episodes || 1}
                                                                    onCardClick={() => collection.anime && navigate(`/anime/${collection.anime.id}`)}
                                                                />
                                                            </Col>
                                                        ))}

                                                    </Row>
                                                ) : (
                                                    <Empty description="还没有追番呢，快去追一部吧～" />
                                                )}
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'completed',
                                        label: `已看完 (${completed.length})`,
                                        icon: <CheckCircleOutlined />,
                                        children: (
                                            <div style={{
                                                backgroundColor: token.colorBgContainer,
                                                borderRadius: '24px',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                                padding: '32px',
                                                marginTop: '16px'
                                            }}>
                                                {completed.length > 0 ? (
                                                    <Row gutter={[20, 24]}>
                                                        {completed.map((collection) => (
                                                            <Col
                                                                xs={24}
                                                                sm={12}
                                                                md={8}
                                                                lg={6}
                                                                xl={4}
                                                                xxl={4}
                                                                key={collection.id}
                                                            >
                                                                <AnimeCardProgress
                                                                    title={collection.anime?.title || ''}
                                                                    poster={collection.anime?.poster_url || ''}
                                                                    rating={collection.anime?.rating || 0}
                                                                    tags={collection.anime?.tags.map(t => t.name) || []}
                                                                    updateInfo={getUpdateInfo(collection.anime!)}
                                                                    userRating={collection.rating}
                                                                    mode="completed"
                                                                    onCardClick={() => collection.anime && navigate(`/anime/${collection.anime.id}`)}
                                                                />
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                ) : (
                                                    <Empty description="还没有看完任何番剧呢～" />
                                                )}
                                            </div>
                                        )
                                    }
                                ]}
                                tabBarStyle={{
                                    backgroundColor: token.colorBgContainer,
                                    borderRadius: '24px 24px 0 0',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                    padding: '0 32px',
                                    margin: 0,
                                    borderBottom: `1px solid ${token.colorBorder}`
                                }}
                            />
                        </>
                    )}
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', color: token.colorTextDescription, background: 'transparent' }}>
                AnimeComGo ©2026
            </Footer>
        </Layout>
    );
};

export default ProfilePage;

