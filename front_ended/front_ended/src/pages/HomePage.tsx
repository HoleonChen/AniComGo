import React from 'react';
import { Layout, Row, Col, theme } from 'antd';
import AnimeCard from '../components/AnimeCard';
import { mockAnimes, getUpdateInfo } from '../data/mockData';

const { Content, Footer } = Layout;

const HomePage: React.FC = () => {
    const { token } = theme.useToken();

    // 只展示热门的（status=2 完结的或者 id<10 的经典）
    const displayAnimes = mockAnimes.filter(a => a.status === 2 || a.id < 10);

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
            {/* 主体内容：注意顶部的 padding 避开固定的 Header */}
            <Content style={{
                padding: '112px 24px 40px 24px',
                display: 'flex',
                justifyContent: 'center',
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

                    <Row gutter={[20, 24]}>
                        {displayAnimes.map((anime) => (
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
                                />
                            </Col>
                        ))}
                    </Row>
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', color: token.colorTextDescription, background: 'transparent' }}>
                AnimeComGo ©2026
            </Footer>
        </Layout>
    );
};

export default HomePage;

