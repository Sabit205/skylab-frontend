import { AppShell, Burger, Group, NavLink, Text, Button, ActionIcon, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconUsers, IconChalkboard, IconLogout, IconGauge,
    IconSun, IconMoonStars, IconReportMoney, IconCalendarEvent, IconSpeakerphone, 
    IconCash, IconChecklist, IconBook, IconUserCircle, IconBooks, IconChartBar, IconEdit
} from '@tabler/icons-react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { axiosPrivate as axios } from '../api/axios';

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

const AppLayout = () => {
    const [opened, { toggle }] = useDisclosure();
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    
    const isGuardian = !!auth.user?.studentId;

    const handleLogout = async () => {
        try {
            if (!isGuardian) {
                await axios.post('/auth/logout', {}, { withCredentials: true });
            } else {
                localStorage.removeItem('guardian-token');
            }
        } catch (error) {
            console.error('Logout API call failed', error);
        } finally {
            setAuth({});
            navigate('/login');
        }
    };

    const adminNavLinks = (
        <>
            <NavLink component={Link} to="/admin" label="Dashboard" leftSection={<IconGauge size="1rem" />} />
            <NavLink component={Link} to="/admin/users" label="User Management" leftSection={<IconUsers size="1rem" />} />
            <NavLink component={Link} to="/admin/subjects" label="Subject Management" leftSection={<IconBooks size="1rem" />} />
            <NavLink component={Link} to="/admin/classes" label="Class Management" leftSection={<IconChalkboard size="1rem" />} />
            <NavLink component={Link} to="/admin/schedule" label="Class Schedule" leftSection={<IconCalendarEvent size="1rem" />} />
            <NavLink component={Link} to="/admin/announcements" label="Announcements" leftSection={<IconSpeakerphone size="1rem" />} />
            <NavLink label="Financials" leftSection={<IconReportMoney size="1rem" />}>
                <NavLink component={Link} to="/admin/finance" label="Revenue & Expenses" />
                <NavLink component={Link} to="/admin/fees" label="Collect Fees" />
                <NavLink component={Link} to="/admin/fees/history" label="Fee History" />
            </NavLink>
        </>
    );

    const teacherNavLinks = (
        <>
            <NavLink component={Link} to="/teacher" label="Dashboard" leftSection={<IconGauge size="1rem" />} />
            <NavLink component={Link} to="/teacher/schedule" label="My Schedule" leftSection={<IconCalendarEvent size="1rem" />} />
            <NavLink component={Link} to="/teacher/attendance" label="Attendance" leftSection={<IconChecklist size="1rem" />} />
            <NavLink component={Link} to="/teacher/performance" label="Submit Performance" leftSection={<IconChartBar size="1rem" />} />
            <NavLink component={Link} to="/teacher/performance-history" label="Performance History" leftSection={<IconBook size="1rem" />} />
            <NavLink component={Link} to="/teacher/planner-review" label="Review Planners" leftSection={<IconChecklist size="1rem" />} />
        </>
    );

    const studentNavLinks = (
        <>
            <NavLink component={Link} to="/student" label="Dashboard" leftSection={<IconGauge size="1rem" />} />
            <NavLink component={Link} to="/student/daily-planner" label="Daily Planner" leftSection={<IconEdit size="1rem" />} />
            <NavLink component={Link} to="/student/planner-history" label="Planner History" leftSection={<IconBook size="1rem" />} />
            <NavLink component={Link} to="/student/schedule" label="My Schedule" leftSection={<IconCalendarEvent size="1rem" />} />
            <NavLink component={Link} to="/student/attendance" label="My Attendance" leftSection={<IconChecklist size="1rem" />} />
            <NavLink component={Link} to="/student/performance" label="My Performance" leftSection={<IconChartBar size="1rem" />} />
            <NavLink component={Link} to="/student/results" label="My Results" leftSection={<IconBook size="1rem" />} />
            <NavLink component={Link} to="/student/fees" label="My Fees" leftSection={<IconCash size="1rem" />} />
            <NavLink component={Link} to="/student/profile" label="My Profile" leftSection={<IconUserCircle size="1rem" />} />
        </>
    );

    const guardianNavLinks = (
        <>
            <NavLink component={Link} to="/guardian/dashboard" label="Dashboard" leftSection={<IconGauge size="1rem" />} />
            <NavLink component={Link} to="/guardian/planner-approval" label="Approve Planners" leftSection={<IconEdit size="1rem" />} />
            <NavLink component={Link} to="/guardian/schedule" label="Schedule" leftSection={<IconCalendarEvent size="1rem" />} />
            <NavLink component={Link} to="/guardian/attendance" label="Attendance" leftSection={<IconChecklist size="1rem" />} />
            <NavLink component={Link} to="/guardian/performance" label="Performance" leftSection={<IconChartBar size="1rem" />} />
            <NavLink component={Link} to="/guardian/results" label="Results" leftSection={<IconBook size="1rem" />} />
            <NavLink component={Link} to="/guardian/fees" label="Fees" leftSection={<IconCash size="1rem" />} />
        </>
    );

    // --- THIS IS THE DEFINITIVE FIX ---
    // The logic is now corrected to properly select and return the guardian links.
    const getNavLinks = () => {
        if (isGuardian) {
            return guardianNavLinks;
        }
        switch (auth.user?.role) {
            case 'Admin': return adminNavLinks;
            case 'Teacher': return teacherNavLinks;
            case 'Student': return studentNavLinks;
            default: return null;
        }
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
                        <Text size="xl" fw={700} variant="gradient" gradient={{ from: isGuardian ? 'indigo' : theme.primaryColor, to: 'cyan', deg: 90 }}>
                            {isGuardian ? 'Guardian Panel' : 'School Dashboard'}
                        </Text>
                    </Group>
                    <ColorSchemeToggle />
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <AppShell.Section>
                    {isGuardian ? (
                        <>
                            <Text fw={500}>Guardian of:</Text>
                            <Text size="lg">{auth.user?.studentName}</Text>
                        </>
                    ) : (
                        <>
                            <Text fw={500}>{auth.user?.fullName}</Text>
                            <Text size="xs" c="dimmed">Role: {auth.user?.role}</Text>
                        </>
                    )}
                </AppShell.Section>

                <AppShell.Section grow mt="md">
                    {getNavLinks()}
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
export default AppLayout;