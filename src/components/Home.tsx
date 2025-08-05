import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Home = () => {
    const { auth } = useAuth();

    if (auth.user) {
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

    return <Navigate to="/login" replace />;
};

export default Home;