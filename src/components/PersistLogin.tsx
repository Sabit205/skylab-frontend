import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { Loader, Center } from "@mantine/core";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => { isMounted = false; }
    }, [auth.accessToken, refresh]);

    return (
        <>
            {isLoading
                ? <Center style={{ height: '100vh' }}><Loader color="blue" /></Center>
                : <Outlet />
            }
        </>
    )
}

export default PersistLogin;