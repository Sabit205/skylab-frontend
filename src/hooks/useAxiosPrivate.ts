import { useEffect } from 'react';
import { axiosPrivate } from '../api/axios';
import useAuth from './useAuth';
import useRefreshToken from './useRefreshToken';

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        // Request interceptor to add the authorization header
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // Only add the header if it doesn't exist already
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle expired tokens
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                
                // If the error is 403 (Forbidden) and we haven't already retried this request
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true; // Mark as retried
                    try {
                        const newAccessToken = await refresh(); // Get a new access token
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest); // Retry the original request
                    } catch (refreshError) {
                        // If the refresh token itself fails, we reject the promise
                        return Promise.reject(refreshError);
                    }
                }
                
                // For all other errors, just reject the promise
                return Promise.reject(error);
            }
        );

        // Cleanup function to eject interceptors when the component unmounts
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [auth, refresh]);

    return axiosPrivate;
};

export default useAxiosPrivate;