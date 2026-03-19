import React from 'react';
import { Layout, Row, Col, theme, Tabs, Empty, Card, Progress, Tag } from 'antd';
import { FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AnimeCard from '../components/AnimeCard';
import { mockUserCollections, getWatchingAndCompleted, getUpdateInfo } from '../data/mockData';

const { Content, Footer } = Layout;

const WatchListPage: React.FC = () => {
    const { token } = theme.useToken();
    const { watching, completed } = getWatchingAndCompleted(mockUserCollections);

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
            <Content style={{
                padding: '112px 24px 40px 24px',
                display: 'flex',
                justifyContent: 'center',
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
                                                        <Card
                                                            style={{ borderRadius: '12px', overflow: 'hidden' }}
                                                            bodyStyle={{ padding: '12px' }}
                                                            cover={
                                                                <div style={{ position: 'relative' }}>
                                                                    <AnimeCard
                                                                        title={collection.anime?.title || ''}
                                                                        poster={collection.anime?.poster_url || ''}
                                                                        rating={collection.anime?.rating || 0}
                                                                        tags={collection.anime?.tags.map(t => t.name) || []}
                                                                        updateInfo={getUpdateInfo(collection.anime!)}
                                                                    />
                                                                    {/* 进度条 */}
                                                                    <div style={{ padding: '8px' }}>
                                                                        <div style={{ fontSize: '12px', marginBottom: '4px', color: token.colorTextDescription }}>
                                                                            进度: {collection.progress}/{collection.anime?.total_episodes}
                                                                        </div>
                                                                        <Progress
                                                                            percent={Math.round((collection.progress / (collection.anime?.total_episodes || 1)) * 100)}
                                                                            size="small"
                                                                            strokeColor={token.colorPrimary}
                                                                        />
                                                                    </div>
                                                                    {/* 用户评分 */}
                                                                    <div style={{ padding: '0 8px 8px 8px', fontSize: '12px' }}>
                                                                        <span style={{ color: token.colorTextDescription }}>评分: </span>
                                                                        <span style={{ color: token.colorWarning, fontWeight: 'bold' }}>
                                                                            {collection.rating}/5 ⭐
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            }
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
                                                        <Card
                                                            style={{ borderRadius: '12px', overflow: 'hidden' }}
                                                            bodyStyle={{ padding: '12px' }}
                                                            cover={
                                                                <div style={{ position: 'relative' }}>
                                                                    <AnimeCard
                                                                        title={collection.anime?.title || ''}
                                                                        poster={collection.anime?.poster_url || ''}
                                                                        rating={collection.anime?.rating || 0}
                                                                        tags={collection.anime?.tags.map(t => t.name) || []}
                                                                        updateInfo={getUpdateInfo(collection.anime!)}
                                                                    />
                                                                    {/* 完成标签 */}
                                                                    <div style={{ padding: '8px' }}>
                                                                        <Tag color="success" style={{ width: '100%', textAlign: 'center' }}>
                                                                            ✓ 已完成
                                                                        </Tag>
                                                                    </div>
                                                                    {/* 用户评分 */}
                                                                    <div style={{ padding: '0 8px 8px 8px', fontSize: '12px' }}>
                                                                        <span style={{ color: token.colorTextDescription }}>评分: </span>
                                                                        <span style={{ color: token.colorWarning, fontWeight: 'bold' }}>
                                                                            {collection.rating}/5 ⭐
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            }
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

