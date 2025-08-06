import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Loader, Center } from '@mantine/core';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    // Get the auth state AND the new isLoading state from our context
    const { auth, isLoading } = useAuth();
    const location = useLocation();

    // --- NEW LOGIC ---
    // 1. Check if the session is currently being restored.
    if (isLoading) {
        // If it is, we display a full-screen loader and WAIT.
        // We do NOT redirect. This prevents the race condition.
        return (
            <Center style={{ height: '100vh' }}>
                <Loader />
            </Center>
        );
    }

    // 2. After loading is complete, we check for authorization.
    const isAuthorized = auth?.user?.role && allowedRoles.includes(auth.user.role);

    if (isAuthorized) {
        // If authorized, render the requested child component (e.g., AdminDashboard)
        return <Outlet />;
    }

    if (auth?.accessToken) {
        // If the user is logged in but doesn't have the right role, send them to the unauthorized page.
        // This can happen if a teacher tries to access /admin.
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    // 3. If loading is complete and there's still no access token, the user is not logged in.
    // Redirect them to the login page.
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;