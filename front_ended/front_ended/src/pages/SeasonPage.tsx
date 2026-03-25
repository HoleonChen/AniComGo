import React from 'react';
import { Layout, Row, Col, theme, Typography, Divider } from 'antd';
import AnimeCard from '../components/AnimeCard';
import { mockAnimes, getUpdateInfo, type Anime } from '../data/mockData';
import heroImage from '../assets/background.jpg';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const { Content, Footer } = Layout;
const { Title } = Typography;

const SeasonPage: React.FC = () => {
    const { token } = theme.useToken();
    const navigate = useNavigate(); // Initialize hook

    // 假设今天是 2026-03-18 (周三)
    // 实际项目中应使用 new Date()
    const today = 3; // 0: Sun, 1: Mon, ..., 3: Wed

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // 1. 过滤连载中的 TV 动画
    const airingAnimes = mockAnimes.filter(a => a.status === 1 && a.type === 'TV');

    // 2. 过滤剧场版
    const movieAnimes = mockAnimes.filter(a => a.type === 'Movie');

    // 3. 按星期分组
    const groupedAnimes: Record<number, Anime[]> = {};
    airingAnimes.forEach(anime => {
        const day = new Date(anime.release_date).getDay();
        if (!groupedAnimes[day]) groupedAnimes[day] = [];
        groupedAnimes[day].push(anime);
    });

    // 4. 生成排序后的星期列表 (从今天开始倒序)
    const sortedDays = [];
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today - i + 7) % 7;
        sortedDays.push(dayIndex);
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
                    maxWidth: '1200px',
                    backgroundColor: token.colorBgContainer,
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    padding: '32px',
                    minHeight: '80vh',
                    transition: 'all 0.3s'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ margin: 0, fontSize: '28px', color: token.colorTextHeading, textAlign: 'center' }}>
                            本季新番放送表 📅
                        </h2>
                    </div>

                    {/* 按星期展示连载动画 */}
                    {sortedDays.map(dayIndex => {
                        const animes = groupedAnimes[dayIndex];
                        if (!animes || animes.length === 0) return null;

                        const isToday = dayIndex === today;

                        return (
                            <div key={dayIndex} style={{ marginBottom: '40px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    borderLeft: `4px solid ${isToday ? token.colorPrimary : token.colorBorder}`,
                                    paddingLeft: '12px'
                                }}>
                                    <Title level={3} style={{ margin: 0, color: isToday ? token.colorPrimary : token.colorText }}>
                                        {weekDays[dayIndex]} {isToday && '(今天)'}
                                    </Title>
                                </div>

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
                                                tags={anime.tags.map(t => t.name)}
                                                updateInfo={getUpdateInfo(anime)}
                                                onClick={() => navigate(`/anime/${anime.id}`)}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        );
                    })}

                    <Divider style={{ margin: '40px 0' }} />

                    {/* 剧场版板块 */}
                    {movieAnimes.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                             <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    borderLeft: `4px solid ${token.colorWarning}`, // 使用不同颜色区分
                                    paddingLeft: '12px'
                                }}>
                                <Title level={3} style={{ margin: 0 }}>
                                    本季剧场版 🎬
                                </Title>
                            </div>

                            <Row gutter={[20, 24]}>
                                {movieAnimes.map((anime) => (
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
                                            tags={anime.tags.map(t => t.name)}
                                            updateInfo={getUpdateInfo(anime)}
                                            onClick={() => navigate(`/anime/${anime.id}`)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                </div>
            </Content>

            <Footer style={{ textAlign: 'center', color: token.colorTextDescription, background: 'transparent' }}>
                AnimeComGo ©2026
            </Footer>
        </Layout>
    );
};

export default SeasonPage;
