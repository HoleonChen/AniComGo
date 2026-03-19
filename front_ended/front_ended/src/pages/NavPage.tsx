import React from 'react';
import { Layout, Menu, Input, Avatar, theme, type MenuProps } from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    VideoCameraOutlined,
    FireOutlined,
    HeartFilled
} from '@ant-design/icons';

const { Header } = Layout;

interface NavPageProps {
    activeTab: string;
    onTabChange: (key: string) => void;
    onProfileClick?: () => void;
}

const NavPage: React.FC<NavPageProps> = ({ activeTab, onTabChange, onProfileClick }) => {
    const { token } = theme.useToken();

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        onTabChange(e.key);
    };

    return (
        <>
            {/* 背景层：固定定位，置于最底层 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0, width: '100vw',
                height: '100vh',
                zIndex: -1,
                // 使用主题背景色，这会自动适配深色模式（变为深灰色）和浅色模式
                backgroundColor: token.colorBgLayout,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                transition: 'all 0.3s'
            }} />

            <Header style={{
                position: 'fixed',
                zIndex: 100,
                width: '100%',
                height: '72px', // 增加高度
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px', // 减小两侧 padding
                background: token.colorBgContainer,
                boxShadow: token.boxShadowTertiary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                boxSizing: 'border-box' // 防止 padding 导致宽度溢出
            }}>
                <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    marginRight: '40px',
                    color: token.colorPrimary, // 使用主题主色
                    cursor: 'pointer',
                    flexShrink: 0
                }}>
                    AniComGo
                </div>

                <Menu
                    mode="horizontal"
                    selectedKeys={[activeTab]}
                    onClick={handleMenuClick}
                    style={{ flex: 1, border: 'none', minWidth: 0, background: 'transparent' }}
                    items={[
                        { key: '1', icon: <FireOutlined />, label: '热门番剧' },
                        { key: '2', icon: <VideoCameraOutlined />, label: '本季新番' },
                        { key: '3', icon: <HeartFilled />, label: '我的追番' },
                    ]}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <Input
                        placeholder="搜下你想看的..."
                        prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
                        style={{
                            width: 220,
                            borderRadius: '20px',
                            backgroundColor: token.colorFillAlter,
                            border: 'none'
                        }}
                    />
                    <Avatar
                        icon={<UserOutlined />}
                        style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }}
                        onClick={onProfileClick}
                    />
                </div>
            </Header>
        </>
    );
};

export default NavPage;
