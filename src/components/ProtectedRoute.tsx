import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { auth } = useAuth();
    const location = useLocation();

    // Check if user is authenticated and has one of the allowed roles
    const isAuthorized = auth?.user?.role && allowedRoles.includes(auth.user.role);

    if (isAuthorized) {
        return <Outlet />;
    }

    if (auth?.accessToken) {
        // User is logged in but trying to access a restricted route
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    // User is not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;