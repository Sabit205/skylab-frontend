import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { axiosPrivate } from "../api/axios";

const PersistLogin = () => {
    const refreshUserToken = useRefreshToken();
    const { auth, setAuth, setIsLoading } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyAuth = async () => {
            const guardianToken = localStorage.getItem('guardian-token');

            try {
                // Prioritize Guardian Session
                if (guardianToken) {
                    const response = await axiosPrivate.post('/api/guardian/refresh', {}, {
                        headers: { 'Authorization': `Bearer ${guardianToken}` }
                    });
                    const { accessToken, user } = response.data;
                    localStorage.setItem('guardian-token', accessToken);
                    if (isMounted) setAuth({ user, accessToken });
                } else {
                    // Fallback to regular user session
                    await refreshUserToken();
                }
            } catch (err) {
                console.log("No active session found to persist.");
                localStorage.removeItem('guardian-token');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        !auth?.accessToken ? verifyAuth() : setIsLoading(false);

        return () => { isMounted = false; }
    }, []);

    return <Outlet />;
}

export default PersistLogin;