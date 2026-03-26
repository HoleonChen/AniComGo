import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    VideoCameraOutlined,
    UserOutlined,
    CommentOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Map path to menu key
    const getSelectedKey = () => {
        const path = location.pathname;
        if (path.includes('/admin/anime')) return 'anime';
        if (path.includes('/admin/users')) return 'users';
        if (path.includes('/admin/comments')) return 'comments';
        return 'dashboard';
    };

    const handleMenuClick = (info: any) => {
        switch (info.key) {
            case 'dashboard':
                navigate('/admin');
                break;
            case 'anime':
                navigate('/admin/anime');
                break;
            case 'users':
                navigate('/admin/users');
                break;
            case 'comments':
                navigate('/admin/comments');
                break;
            default:
                break;
        }
    };

    const userMenu = {
        items: [
            {
                key: 'logout',
                label: '退出登录',
                icon: <LogoutOutlined />,
                onClick: () => {
                    logout();
                    navigate('/');
                }
            }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {collapsed ? 'ACG' : 'AniComGo 后台'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[getSelectedKey()]}
                    selectedKeys={[getSelectedKey()]}
                    onClick={handleMenuClick}
                    items={[
                        {
                            key: 'dashboard',
                            icon: <DashboardOutlined />,
                            label: '仪表盘',
                        },
                        {
                            key: 'anime',
                            icon: <VideoCameraOutlined />,
                            label: '番剧管理',
                        },
                        {
                            key: 'users',
                            icon: <UserOutlined />,
                            label: '用户管理',
                        },
                        {
                            key: 'comments',
                            icon: <CommentOutlined />,
                            label: '评论审核',
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>欢迎, {user?.username}</span>
                        <Dropdown menu={userMenu} placement="bottomRight">
                             <Avatar src={user?.avatar_url} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;

