import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import HomePage from './pages/HomePage';
import SeasonPage from './pages/SeasonPage';
import WatchListPage from './pages/WatchListPage';
import ProfilePage from './pages/ProfilePage';
import NavPage from './pages/NavPage';

const App: React.FC = () => {
    // 自动检测系统深色模式 (可选)
    const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [activeTab, setActiveTab] = useState('1');
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const renderContent = () => {
        // 如果点击了头像，显示用户资料页面
        if (showProfile) {
            return <ProfilePage />;
        }

        // 否则显示菜单对应的页面
        switch (activeTab) {
            case '1':
                return <HomePage />;
            case '2':
                return <SeasonPage />;
            case '3':
                return <WatchListPage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#ff679a', // 保持品牌色
                    borderRadius: 8,
                    ...(isDarkMode && {
                        colorBgBase: '#222222', // 使用较亮的深灰色作为底色
                    }),
                },
            }}
        >
            <NavPage
                activeTab={showProfile ? '' : activeTab}
                onTabChange={(key) => {
                    setActiveTab(key);
                    setShowProfile(false); // 返回到内容页面
                }}
                onProfileClick={() => setShowProfile(true)}
            />
            {renderContent()}
        </ConfigProvider>
    );
};

export default App;
