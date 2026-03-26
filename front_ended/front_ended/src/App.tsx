import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import SeasonPage from './pages/SeasonPage';
import WatchListPage from './pages/WatchListPage';
import ProfilePage from './pages/ProfilePage';
import AnimeDetailPage from './pages/AnimeDetailPage'; // Import AnimeDetailPage
import SearchPage from './pages/SearchPage';
import NavPage from './pages/NavPage';
import LoginModal from './components/LoginModal';
import AdminLayout from './layout/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/Dashboard';
import AnimeMgt from './pages/admin/AnimeMgt';
import UserMgt from './pages/admin/UserMgt';
import CommentAudit from './pages/admin/CommentAudit';

const App: React.FC = () => {
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
                    colorPrimary: '#ff679a',
                    borderRadius: 8,
                    ...(isDarkMode && {
                        colorBgBase: '#222222',
                    }),
                },
            }}
        >
            <AuthProvider>
                <Routes>
                    {/* Admin Routes */}
                    <Route element={<AdminRoute />}>
                        <Route path="admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="anime" element={<AnimeMgt />} />
                            <Route path="users" element={<UserMgt />} />
                            <Route path="comments" element={<CommentAudit />} />
                        </Route>
                    </Route>

                    {/* User Routes */}
                    <Route element={<NavPage />}>
                        <Route index element={<HomePage />} />
                        <Route path="season" element={<SeasonPage />} />
                        <Route path="watchlist" element={<WatchListPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="anime/:id" element={<AnimeDetailPage />} /> {/* Add Route */}
                        <Route path="search" element={<SearchPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <LoginModal />
                <Outlet />
            </AuthProvider>
        </ConfigProvider>
    );
};

export default App;
