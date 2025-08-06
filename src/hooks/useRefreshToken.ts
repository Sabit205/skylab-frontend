import axios from '../api/axios'; // Use the default instance for this specific call
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        // This is correct: the GET request to the refresh endpoint MUST include `withCredentials: true`
        // so the browser sends the httpOnly cookie.
        const response = await axios.get('/auth/refresh', {
            withCredentials: true,
        });
        
        // Update the global auth state with the new access token and user info
        setAuth(prev => {
            console.log('Session refreshed. New access token received.');
            return { 
                ...prev, 
                user: response.data.user, 
                accessToken: response.data.accessToken 
            };
        });
        
        // Return the new access token so it can be used by any interceptor that called it
        return response.data.accessToken;
    };
    return refresh;
};

export default useRefreshToken;