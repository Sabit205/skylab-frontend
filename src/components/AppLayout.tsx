import { AppShell, Burger, Group, NavLink, Text, Button, ActionIcon, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconUsers, IconChalkboard, IconLogout, IconGauge,
    IconSun, IconMoonStars, IconReportMoney, IconCalendarEvent, IconSpeakerphone, 
    IconCash, IconChecklist, IconBook, IconUserCircle
} from '@tabler/icons-react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { axiosPrivate as axios } from '../api/axios.ts';
import { useUIStore } from '../store/uiStore';

function ColorSchemeToggle() {
    const { colorScheme, toggleColorScheme } = useUIStore();
    return (
        <ActionIcon
            onClick={toggleColorScheme}
            size="lg"
            variant="default"
            aria-label="Toggle color scheme"
        >
            {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoonStars size="1.2rem" />}
        </ActionIcon>
    );
}

const AppLayout = () => {
    const [opened, { toggle }] = useDisclosure();
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const theme = useMantineTheme();

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout API call failed', error);
        } finally {
            setAuth({});
            navigate('/login');
        }
    }

    const adminNavLinks = (
        <>
            <NavLink component={Link} to="/admin" label="Dashboard" leftSection={<IconGauge size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/admin/users" label="User Management" leftSection={<IconUsers size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/admin/classes" label="Class Management" leftSection={<IconChalkboard size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/admin/schedule" label="Class Schedule" leftSection={<IconCalendarEvent size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/admin/announcements" label="Announcements" leftSection={<IconSpeakerphone size="1rem" stroke={1.5} />} />
            <NavLink label="Financials" leftSection={<IconReportMoney size="1rem" stroke={1.5} />}>
                <NavLink component={Link} to="/admin/finance" label="Revenue & Expenses" leftSection={<IconCash size="0.8rem" />} />
                <NavLink component={Link} to="/admin/fees" label="Collect Fees" leftSection={<IconCash size="0.8rem" />} />
                <NavLink component={Link} to="/admin/fees/history" label="Fee History" leftSection={<IconCash size="0.8rem" />} />
            </NavLink>
        </>
    );

    const teacherNavLinks = (
        <>
            <NavLink component={Link} to="/teacher" label="Dashboard" leftSection={<IconGauge size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/teacher/schedule" label="My Schedule" leftSection={<IconCalendarEvent size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/teacher/attendance" label="Attendance" leftSection={<IconChecklist size="1rem" stroke={1.5} />} />
        </>
    );

    const studentNavLinks = (
        <>
            <NavLink component={Link} to="/student" label="Dashboard" leftSection={<IconGauge size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/student/schedule" label="My Schedule" leftSection={<IconCalendarEvent size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/student/attendance" label="My Attendance" leftSection={<IconChecklist size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/student/results" label="My Results" leftSection={<IconBook size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/student/fees" label="My Fees" leftSection={<IconCash size="1rem" stroke={1.5} />} />
            <NavLink component={Link} to="/student/profile" label="My Profile" leftSection={<IconUserCircle size="1rem" stroke={1.5} />} />
        </>
    );

    const getNavLinks = () => {
        switch (auth.user?.role) {
            case 'Admin': return adminNavLinks;
            case 'Teacher': return teacherNavLinks;
            case 'Student': return studentNavLinks;
            default: return null;
        }
    }

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group><Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" /><Text size="xl" fw={700} variant="gradient" gradient={{ from: theme.primaryColor, to: 'cyan', deg: 90 }}>School Dashboard</Text></Group>
                    <ColorSchemeToggle />
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <AppShell.Section><Text fw={500}>{auth.user?.fullName}</Text><Text size="xs" c="dimmed">Role: {auth.user?.role}</Text></AppShell.Section>
                <AppShell.Section grow mt="md">{getNavLinks()}</AppShell.Section>
                <AppShell.Section><Button onClick={handleLogout} fullWidth leftSection={<IconLogout size={16} />} variant="light" color="red">Logout</Button></AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main><Outlet /></AppShell.Main>
        </AppShell>
    );
};
export default AppLayout;