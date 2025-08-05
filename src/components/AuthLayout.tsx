import { Outlet, useLocation } from "react-router-dom";
import { Paper, Title, Text, Center, Stack, useMantineColorScheme } from "@mantine/core";
import logo from '../assets/logo.svg';

const AuthLayout = () => {
    const { colorScheme } = useMantineColorScheme();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <Center 
            style={{ 
                minHeight: '100vh', 
                backgroundColor: colorScheme === 'dark' ? '#1A1B1E' : '#F8F9FA'
            }}
            p="md"
        >
            <Paper radius="md" p="xl" withBorder shadow="xl" style={{ width: '100%', maxWidth: '420px' }}>
                <Stack align="center">
                    <img src={logo} alt="App Logo" style={{ width: 60, height: 60, marginBottom: '1rem' }} />
                    <Title order={2} ta="center">
                        {isLoginPage ? 'Welcome Back!' : 'Create Your Account'}
                    </Title>
                    <Text c="dimmed" size="sm" ta="center">
                        {isLoginPage ? 'Sign in to continue to the dashboard' : 'Join our community to get started'}
                    </Text>
                </Stack>
                <Outlet />
            </Paper>
        </Center>
    );
};

export default AuthLayout;