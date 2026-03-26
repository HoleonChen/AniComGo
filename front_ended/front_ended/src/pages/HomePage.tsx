import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, theme, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import { getUpdateInfo } from '../utils/animeUtils'; // Helper still useful
import animeService from '../services/animeService';
import type { Anime } from '../data/Model';
import heroImage from '../assets/background.jpg';

const { Content, Footer } = Layout;

const HomePage: React.FC = () => {
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const [animes, setAnimes] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnimes = async () => {
            try {
                // Fetch popular/completed animes (Simulated by status=2 or just a general fetch for now)
                const { list } = await animeService.getAnimes(1, 20); 
                // For demo, if list is empty, falling back might be confusing, so let's just use what we get.
                // Or filter locally if backend doesn't support specific filters yet.
                setAnimes(list);
            } catch (error) {
                console.error('Failed to fetch animes', error);
                message.error('无法获取番剧列表');
            } finally {
                setLoading(false);
            }
        };

        fetchAnimes();
    }, []);

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

            {/* 主体内容：注意顶部的 padding 避开固定的 Header */}
            <Content style={{
                padding: '112px 24px 40px 24px',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative', // Ensure content is above background
                zIndex: 1
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    backgroundColor: token.colorBgContainer,
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    padding: '32px',
                    minHeight: '80vh',
                    transition: 'all 0.3s'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                        <h2 style={{ margin: 0, fontSize: '24px', color: token.colorTextHeading }}>大家都在看 🔥</h2>
                        <span style={{ color: token.colorLink, cursor: 'pointer', fontSize: '16px' }}>查看更多 {'>'}</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Row gutter={[20, 24]}>
                            {animes.map((anime) => (
                                <Col
                                    xs={24}
                                    sm={12}
                                    md={8}
                                    lg={6}
                                    xl={4}
                                    xxl={4}
                                    key={anime.id}
                                >
                                    <AnimeCard
                                        title={anime.title}
                                        poster={anime.poster_url}
                                        rating={anime.rating}
                                        tags={anime.tags ? anime.tags.map(t => t.name) : []}
                                        updateInfo={getUpdateInfo(anime)}
                                        onClick={() => navigate(`/anime/${anime.id}`)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', color: token.colorTextDescription, background: 'transparent' }}>
                AnimeComGo ©2026
            </Footer>
        </Layout>
    );
};

export default HomePage;
