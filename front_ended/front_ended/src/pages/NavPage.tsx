import React, { useState } from 'react';
import { Layout, Menu, Input, Avatar, theme, type MenuProps, Button, Dropdown } from 'antd'; // Add Dropdown
import {
    SearchOutlined,
    UserOutlined,
    VideoCameraOutlined,
    FireOutlined,
    HeartFilled,
    LogoutOutlined,
    SettingOutlined // Add SettingOutlined
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const { Header } = Layout;

const routeByMenuKey: Record<string, string> = {
    '1': '/',
    '2': '/season',
    '3': '/watchlist',
};

const menuKeyByPath: Record<string, string> = {
    '/': '1',
    '/season': '2',
    '/watchlist': '3',
};

const NavPage: React.FC = () => {
    const { token } = theme.useToken();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, openLoginModal, logout } = useAuth(); // Destructure logout
    const [searchQuery, setSearchQuery] = useState('');

    const activeTab = menuKeyByPath[location.pathname] ?? '';

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(routeByMenuKey[e.key] ?? '/');
    };

    const menuItemsList: MenuProps['items'] = [
        ...(user?.role === 1
            ? [
                {
                    key: 'admin',
                    label: '管理后台',
                    icon: <SettingOutlined />,
                    onClick: () => navigate('/admin'),
                },
                { type: 'divider' as const },
            ]
            : []),
        {
            key: 'profile',
            label: '个人中心',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile'),
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            label: '退出登录',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                logout();
                navigate('/');
            },
        },
    ];

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
                <div
                    style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        marginRight: '40px',
                        color: token.colorPrimary, // 使用主题主色
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                    onClick={() => navigate('/')}
                >
                    AniComGo
                </div>

                <Menu
                    mode="horizontal"
                    selectedKeys={activeTab ? [activeTab] : []}
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onPressEnter={() => {
                            if (searchQuery.trim()) {
                                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                            }
                        }}
                        style={{
                            width: 220,
                            borderRadius: '20px',
                            backgroundColor: token.colorFillAlter,
                            border: 'none'
                        }}
                    />
                    {isAuthenticated ? (
                        <Dropdown menu={{ items: menuItemsList }} placement="bottomRight" arrow>
                            <Avatar
                                src={user?.avatar_url}
                                icon={<UserOutlined />}
                                style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }}
                            />
                        </Dropdown>
                    ) : (
                         <Button type="primary" onClick={openLoginModal} shape="round">
                            登录
                        </Button>
                    )}
                </div>
            </Header>

            <Outlet />
        </>
    );
};

export default NavPage;
