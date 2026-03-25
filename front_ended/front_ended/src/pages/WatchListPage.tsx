import React, { useState, useMemo } from 'react';
import { Layout, theme, Tabs, Empty, Grid, Row, Col, Button } from 'antd'; // Add Grid, Row, Col
import { FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import useAuth
import AnimeCardExpanded from '../components/AnimeCardExpanded';
import AnimeCardProgress from '../components/AnimeCardProgress'; // Import this
import { mockUserCollections, getWatchingAndCompleted, getUpdateInfo } from '../data/mockData';
import heroImage from '../assets/background.jpg';

const { Content, Footer } = Layout;
const { useBreakpoint } = Grid; // Use Breakpoint hook

const WatchListPage: React.FC = () => {
    const { token } = theme.useToken();
    const screens = useBreakpoint(); // Get screen sizes
    const navigate = useNavigate(); // Initialize hook
    const { isAuthenticated, openLoginModal } = useAuth();
    const [collections, setCollections] = useState(mockUserCollections);
    
    // Memoize the derived lists
    const { watching, completed } = useMemo(() => getWatchingAndCompleted(collections), [collections]);

    const handleProgressUpdate = (collectionId: number, newProgress: number) => {
        setCollections(prev => prev.map(c => 
            c.id === collectionId ? { ...c, progress: newProgress } : c
        ));
    };

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
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '400px',
                            backgroundColor: token.colorBgContainer,
                            borderRadius: '24px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        }}>
                            <Empty description={
                                <span>
                                    请先登录以查看您的追番列表
                                </span>
                            }>
                                <Button type="primary" onClick={openLoginModal}>立即登录</Button>
                            </Empty>
                        </div>
                    ) : (
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
                                                    {watching.map((collection) => {
                                                        const isMobile = !screens.sm && (screens.xs || !screens.md); // Mobile check
                                                        
                                                        if (isMobile) {
                                                            return (
                                                                <Col span={24} key={collection.id}>
                                                                     <AnimeCardProgress
                                                                         title={collection.anime?.title || ''}
                                                                         poster={collection.anime?.poster_url || ''}
                                                                         rating={collection.anime?.rating || 0}
                                                                         tags={collection.anime?.tags.map(t => t.name) || []}
                                                                         updateInfo={getUpdateInfo(collection.anime!)}
                                                                         mode='watching'
                                                                         progress={collection.progress}
                                                                         totalEpisodes={collection.anime?.total_episodes}
                                                                         userRating={collection.rating}
                                                                         onCardClick={() => navigate(`/anime/${collection.anime!.id}`)} // Add navigation
                                                                     />
                                                                </Col>
                                                            )
                                                        }
                                                        
                                                        return (
                                                            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} key={collection.id}>
                                                                <AnimeCardExpanded
                                                                    anime={collection.anime!}
                                                                    progress={collection.progress}
                                                                    onUpdateProgress={(newVal) => handleProgressUpdate(collection.id, newVal)}
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
                                                    {completed.map((collection) => (
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
                                                                tags={collection.anime?.tags.map(t => t.name) || []}
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
                    )}
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', color: token.colorTextDescription, background: 'transparent' }}>
                AnimeComGo ©2026
            </Footer>
        </Layout>
    );
};

export default WatchListPage;

