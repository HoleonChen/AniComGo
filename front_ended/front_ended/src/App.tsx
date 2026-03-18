import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
    // 自动检测系统深色模式 (可选)
    const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#ff679a', // 保持品牌色
                    borderRadius: 8,
                },
            }}
        >
            <HomePage />
        </ConfigProvider>
    );
};

export default App;

