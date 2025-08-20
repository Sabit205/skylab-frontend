import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Loader, Center } from '@mantine/core';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { auth, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Center style={{ height: '100vh' }}><Loader /></Center>;
    }

    const isGuardianRoute = location.pathname.startsWith('/guardian');
    
    // Guardian Access Logic
    if (isGuardianRoute) {
        const isGuardianAuthenticated = auth?.user?.studentId && auth?.accessToken;
        return isGuardianAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Regular User Access Logic
    if (allowedRoles) {
        const isAuthorized = auth?.user?.role && allowedRoles.includes(auth.user.role);
        if (isAuthorized) return <Outlet />;
        if (auth?.accessToken) return <Navigate to="/unauthorized" state={{ from: location }} replace />;
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Fallback if no roles are provided for a non-guardian route
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;