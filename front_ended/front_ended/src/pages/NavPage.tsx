import React, { useState } from 'react';
import { Layout, Menu, Input, Avatar, theme, type MenuProps } from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    VideoCameraOutlined,
    FireOutlined,
    HeartFilled
} from '@ant-design/icons';

const { Header } = Layout;

const NavPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('1');
    const { token } = theme.useToken();

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        setActiveTab(e.key);
    };

    return (
        <Header style={{
            position: 'fixed',
            zIndex: 100,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // 居中内容
            padding: '0 24px', // 减小两侧 padding
            background: token.colorBgContainer,
            boxShadow: token.boxShadowTertiary,
            borderBottom: `1px solid ${token.colorBorderSecondary}`
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1920px', // 限制最大宽度，避免在超宽屏上太分散
                display: 'flex',
                alignItems: 'center',
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
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }} />
                </div>
            </div>
        </Header>
    );
};

export default NavPage;

