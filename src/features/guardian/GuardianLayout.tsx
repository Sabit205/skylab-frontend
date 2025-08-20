import { AppShell, Burger, Group, NavLink, Text, Button, ActionIcon, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconGauge,
    IconCalendarEvent,
    IconChecklist,
    IconBook,
    IconCash,
    IconLogout,
    IconSun,
    IconMoonStars,
    IconChartBar,
    IconEdit
} from '@tabler/icons-react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function ColorSchemeToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    return (
        <ActionIcon
            onClick={() => toggleColorScheme()}
            size="lg"
            variant="default"
            aria-label="Toggle color scheme"
        >
            {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoonStars size="1.2rem" />}
        </ActionIcon>
    );
}

const GuardianLayout = () => {
    const [opened, { toggle }] = useDisclosure();
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    
    const handleLogout = () => {
        localStorage.removeItem('guardian-token');
        setAuth({});
        navigate('/login');
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Text
                            size="xl"
                            fw={700}
                            variant="gradient"
                            gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}
                        >
                            Guardian Panel
                        </Text>
                    </Group>
                    <ColorSchemeToggle />
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <AppShell.Section>
                    <Text fw={500}>Guardian of:</Text>
                    <Text size="lg">{auth.user?.studentName}</Text>
                </AppShell.Section>
                <AppShell.Section grow mt="md">
                    <NavLink component={Link} to="/guardian/dashboard" label="Dashboard" leftSection={<IconGauge size="1rem" />} />
                    <NavLink component={Link} to="/guardian/planner-approval" label="Approve Planners" leftSection={<IconEdit size="1rem" />} />
                    <NavLink component={Link} to="/guardian/schedule" label="Schedule" leftSection={<IconCalendarEvent size="1rem" />} />
                    <NavLink component={Link} to="/guardian/attendance" label="Attendance" leftSection={<IconChecklist size="1rem" />} />
                    <NavLink component={Link} to="/guardian/performance" label="Performance" leftSection={<IconChartBar size="1rem" />} />
                    <NavLink component={Link} to="/guardian/results" label="Results" leftSection={<IconBook size="1rem" />} />
                    <NavLink component={Link} to="/guardian/fees" label="Fees" leftSection={<IconCash size="1rem" />} />
                </AppShell.Section>
                <AppShell.Section>
                    <Button onClick={handleLogout} fullWidth leftSection={<IconLogout size={16} />} variant="light" color="red">
                        Logout
                    </Button>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
};

export default GuardianLayout;