import React, { useState, useMemo, useEffect } from 'react';
import { Layout, theme, Tabs, Empty, Grid, Row, Col, Button, message } from 'antd'; // Add Grid, Row, Col
import { FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import useAuth
import userService from '../services/userService';
import type { Collection, Tag } from '../data/Model';
import AnimeCardExpanded from '../components/AnimeCardExpanded';
import AnimeCardProgress from '../components/AnimeCardProgress'; // Import this
import { getUpdateInfo } from '../utils/animeUtils';
import { processUserWatchList } from '../utils/watchListUtils';
import heroImage from '../assets/background.jpg';

const { Content, Footer } = Layout;
const { useBreakpoint } = Grid; // Use Breakpoint hook

const WatchListPage: React.FC = () => {
    const { token } = theme.useToken();
    const screens = useBreakpoint(); // Get screen sizes
    const navigate = useNavigate(); // Initialize hook
    const { isAuthenticated, openLoginModal } = useAuth();
    // In real app, fetch from API: useEffect(() => { if(isAuthenticated) fetchCollections() }, [isAuthenticated])
    const [collections, setCollections] = useState<Collection[]>([]); // Empty initial state

    useEffect(() => {
        const fetchCollections = async () => {
            if (isAuthenticated) {
                try {
                    const data = await userService.getCollections();
                    setCollections(data);
                } catch (error) {
                    message.error('获取追番列表失败');
                }
            }
        };
        fetchCollections();
    }, [isAuthenticated]);

    // Memoize the derived lists
    const { watching, completed } = useMemo(() => {
        // Filter out collections with missing anime data to prevent errors
        const validCollections = collections.filter(c => c.anime);
        return processUserWatchList(validCollections);
    }, [collections]);

    const handleProgressUpdate = async (collectionId: number, animeId: number, newProgress: number) => {
        // Optimistic update
        setCollections(prev => prev.map(c => 
            c.id === collectionId ? { ...c, progress: newProgress } : c
        ));

        // Call API
        try {
            const success = await userService.updateCollectionProgress(animeId, newProgress);
            if (!success) {
                // Revert if failed
                message.error('更新进度失败');
                // You might ideally need to fetch the original value or re-fetch entirely
                const data = await userService.getCollections();
                setCollections(data);
            } else {
                message.success(`更新进度至第 ${newProgress} 话`);
            }
        } catch (e) {
            message.error('更新进度异常');
        }
    };

    if (!isAuthenticated) {
        return (
             <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent', position: 'relative' }}>
                <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: token.colorBgLayout }}>
                    {/* Background similar to other pages or simplified */}
                     <div style={{
                         width: '100%', height: '100%',
                         backgroundImage: `url(${heroImage})`,
                         backgroundSize: 'cover',
                         opacity: 0.1
                     }} />
                </div>
                <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', zIndex: 1 }}>
                     <div style={{ textAlign: 'center', background: token.colorBgContainer, padding: '40px', borderRadius: '16px' }}>
                        <Empty description="请先登录查看您的追番列表" />
                        <Button type="primary" onClick={openLoginModal} style={{ marginTop: '16px' }}>
                            去登录
                        </Button>
                     </div>
                </Content>
             </Layout>
        );
    }

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
                                            <Row gutter={[24, 24]}>
                                                {watching.map((collection: Collection) => {
                                                    const isMobile = !screens.sm && (screens.xs || !screens.md); // Mobile check
                                                    
                                                    if (isMobile) {
                                                        return (
                                                            <Col span={24} key={collection.id}>
                                                                 <AnimeCardProgress
                                                                     title={collection.anime?.title || ''}
                                                                     poster={collection.anime?.poster_url || ''}
                                                                     rating={collection.anime?.rating || 0}
                                                                     tags={collection.anime?.tags.map((t: Tag) => t.name) || []}
                                                                     updateInfo={getUpdateInfo(collection.anime!)}
                                                                     mode='watching'
                                                                     progress={collection.progress}
                                                                     totalEpisodes={collection.anime?.total_episodes}
                                                                     userRating={collection.rating}
                                                                     onCardClick={() => navigate(`/anime/${collection.anime!.id}`)} // Add navigation
                                                                     onUpdateProgress={(newVal) => handleProgressUpdate(collection.id, collection.anime!.id, newVal)}
                                                                 />
                                                            </Col>
                                                        )
                                                    }
                                                    
                                                    return (
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} key={collection.id}>
                                                            <AnimeCardExpanded
                                                                anime={collection.anime!}
                                                                progress={collection.progress}
                                                                onUpdateProgress={(newVal) => handleProgressUpdate(collection.id, collection.anime!.id, newVal)}
                                                                onClick={() => navigate(`/anime/${collection.anime!.id}`)} // Add navigation
                                                            />
                                                        </Col>
                                                    );
                                                })}
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
                                            <Row gutter={[24, 24]}>
                                                {completed.map((collection: Collection) => (
                                                    <Col
                                                        xs={24}
                                                        sm={12}
                                                        md={8}
                                                        lg={6}
                                                        xl={6}
                                                        xxl={6}
                                                        key={collection.id}
                                                    >
                                                        <AnimeCardProgress
                                                            title={collection.anime?.title || ''}
                                                            poster={collection.anime?.poster_url || ''}
                                                            rating={collection.anime?.rating || 0}
                                                            tags={collection.anime?.tags.map((t: Tag) => t.name) || []}
                                                            updateInfo={getUpdateInfo(collection.anime!)}
                                                            mode="completed"
                                                            userRating={collection.rating}
                                                            progress={collection.progress}
                                                            totalEpisodes={collection.anime?.total_episodes}
                                                            onCardClick={() => navigate(`/anime/${collection.anime!.id}`)} // Fixed prop name
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
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', color: token.colorTextDescription, background: 'transparent' }}>
                AnimeComGo ©2026
            </Footer>
        </Layout>
    );
};

export default WatchListPage;
