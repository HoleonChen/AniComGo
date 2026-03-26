import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Input, theme, Empty, Spin, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import { getUpdateInfo } from '../utils/animeUtils';
import type { Anime } from '../data/Model';
import animeService from '../services/animeService';
import heroImage from '../assets/background.jpg';

const { Content } = Layout;

const SearchPage: React.FC = () => {
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [localQuery, setLocalQuery] = useState(query);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Anime[]>([]);

    useEffect(() => {
        setLocalQuery(query);
        const performSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                // Call animeService with query
                const { list } = await animeService.getAnimes(1, 50, query);
                setResults(list);
            } catch (error) {
                console.error("Search failed:", error);
                message.error("搜索失败");
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    const handleSearch = (value: string) => {
        if (value.trim()) {
            setSearchParams({ q: value.trim() });
        } else {
            setSearchParams({});
            setResults([]);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent', position: 'relative' }}>
             {/* Background Layer (Same as HomePage) */}
             <div style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'flex', background: token.colorBgLayout }}>
                 <div style={{
                     flex: 1,
                     backgroundImage: `url(${heroImage})`,
                     backgroundSize: 'auto 130%',
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'right center',
                     transform: 'scaleX(-1)',
                 }} />
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
                 <div style={{
                     flex: 1,
                     backgroundImage: `url(${heroImage})`,
                     backgroundSize: 'auto 130%',
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'right center',
                     transform: 'scaleX(1)',
                 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
            </div>

            <Content style={{
                padding: '112px 24px 40px 24px',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
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
                    {/* Search Box Area */}
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                         <h2 style={{ marginBottom: '24px', color: token.colorTextHeading }}>搜索结果: "{query}"</h2>
                         <Input.Search
                            placeholder="搜索番剧..."
                            allowClear
                            enterButton="搜索"
                            size="large"
                            value={localQuery}
                            onChange={e => setLocalQuery(e.target.value)}
                            onSearch={handleSearch}
                            style={{ maxWidth: '600px' }}
                         />
                    </div>

                    {loading ? (
                         <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                         </div>
                    ) : (
                        <>
                            {results.length > 0 ? (
                                <Row gutter={[20, 24]}>
                                    {results.map((anime) => (
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
                            ) : (
                                <Empty description="暂无搜索结果" />
                            )}
                        </>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default SearchPage;

