import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { Loader, Center } from "@mantine/core";

const PersistLogin = () => {
    // We no longer need a local isLoading state here. We will use the global one.
    const refresh = useRefreshToken();
    const { auth, setIsLoading } = useAuth(); // Get setIsLoading from our context

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                // Attempt to get a new access token using the refresh token cookie
                await refresh();
            } catch (err) {
                console.error("Persistent login failed:", err);
            } finally {
                // CRITICAL: This block runs whether the refresh succeeds or fails.
                // We set the global loading state to `false` here, signaling that
                // the session restoration attempt is complete.
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        // If we don't have an access token in our state, it means it's a fresh page load.
        // So, we attempt to verify the refresh token.
        // If we already have an access token (e.g., from navigating after login), we don't need to refresh.
        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => { isMounted = false; }
    }, [auth.accessToken, refresh, setIsLoading]);

    // We no longer need to show a loader here, because the ProtectedRoute will handle it.
    // We just render the child routes.
    return <Outlet />;
}

export default PersistLogin;