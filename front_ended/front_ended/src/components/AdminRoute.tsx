import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {useAuth} from "../context/AuthContext.tsx";

const AdminRoute: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    
    // In a real app, you might want to wait for an 'isLoading' flag from AuthContext
    // For now, if not authenticated, we redirect.
    
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Role 1 is Admin
    if (user?.role !== 1) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;


