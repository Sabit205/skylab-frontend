import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Center, Loader } from '@mantine/core';

const Home = () => {
    const { auth, isLoading } = useAuth();
    
    // While the session is being restored, show a loader to prevent flashes of other pages.
    if (isLoading) {
        return <Center style={{ height: '100vh' }}><Loader /></Center>;
    }

    // After loading, check the auth state to determine where to redirect.
    if (auth.user) {
        // Handle regular users (Admin, Teacher, Student)
        if (auth.user.role) {
            switch (auth.user.role) {
                case 'Admin':
                    return <Navigate to="/admin" replace />;
                case 'Teacher':
                    return <Navigate to="/teacher" replace />;
                case 'Student':
                    return <Navigate to="/student" replace />;
                default:
                    return <Navigate to="/login" replace />;
            }
        }
        // Handle Guardian users
        if (auth.user.studentId) {
            return <Navigate to="/guardian/dashboard" replace />;
        }
    }

    // If not loading and no user is authenticated, redirect to the main login page.
    return <Navigate to="/login" replace />;
};

export default Home;