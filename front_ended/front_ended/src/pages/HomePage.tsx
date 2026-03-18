import React from 'react';
import { Layout, Row, Col, theme } from 'antd';
import AnimeCard from '../components/AnimeCard';
import NavPage from './NavPage';

const { Content, Footer } = Layout;

// 1. 严格的类型定义
interface Anime {
    id: number;
    title: string;
    rating: number;
    tags: string[];
    poster: string;
    updateInfo: string;
}

// 2. 模拟数据
const mockAnimes: Anime[] = [
    { id: 1, title: '葬送的芙莉莲', rating: 4.9, tags: ['奇幻', '治愈'], poster: 'https://img.yzcdn.cn/vant/cat.jpeg', updateInfo: '全28话' },
    { id: 2, title: '孤独摇滚！', rating: 4.8, tags: ['音乐', '日常'], poster: 'https://img.yzcdn.cn/vant/apple-1.jpg', updateInfo: '完结' },
    { id: 3, title: '咒术回战 第二季', rating: 4.5, tags: ['热血', '战斗'], poster: 'https://img.yzcdn.cn/vant/apple-2.jpg', updateInfo: '全23话' },
    { id: 4, title: '间谍过家家', rating: 4.6, tags: ['喜剧', '亲子'], poster: 'https://img.yzcdn.cn/vant/apple-3.jpg', updateInfo: '完结' },
    { id: 5, title: '迷宫饭', rating: 4.7, tags: ['美食', '奇幻'], poster: 'https://img.yzcdn.cn/vant/cat.jpeg', updateInfo: '第12话' },
    { id: 6, title: '排球少年！！', rating: 4.9, tags: ['运动', '热血'], poster: 'https://img.yzcdn.cn/vant/apple-1.jpg', updateInfo: '剧场版热映' },
];

const HomePage: React.FC = () => {
    const { token } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: token.colorBgLayout }}>
            {/* 导航栏：固定在顶部 */}
            <NavPage />

            {/* 主体内容：注意顶部的 padding 避开固定的 Header */}
            <Content style={{ padding: '84px 24px 24px 24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '1920px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: token.colorTextHeading }}>大家都在看 🔥</h2>
                        <span style={{ color: token.colorLink, cursor: 'pointer' }}>查看更多 {'>'}</span>
                    </div>

                    <Row gutter={[20, 24]}>
                        {mockAnimes.map((anime) => (
                            <Col
                                xs={12}
                                sm={8}
                                md={6}
                                lg={4}
                                xl={4}
                                xxl={3} // 超大屏一行显示更多
                                key={anime.id}
                            >
                                <AnimeCard
                                    title={anime.title}
                                    poster={anime.poster}
                                    rating={anime.rating}
                                    tags={anime.tags}
                                    updateInfo={anime.updateInfo}
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

