import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { Title, Text, SimpleGrid, Paper, Group, RingProgress, Stack, Alert, Loader, Center, Card, Grid } from '@mantine/core';
import { IconInfoCircle, IconClock } from '@tabler/icons-react';
import { formatTime } from '../../../utils/timeUtils';
import { getStartOfWeek } from '../../../utils/dateUtils';

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <Paper withBorder p="md" radius="md" shadow="sm">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
        <Text fw={700} size="xl" truncate>{value}</Text>
    </Paper>
);

const getDayOfWeek = () => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();

interface StudentDashboardProps {
    isGuardian?: boolean;
}

const StudentDashboard = ({ isGuardian = false }: StudentDashboardProps) => {
    const { auth } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const dashboardEndpoint = isGuardian ? '/api/guardian/dashboard' : '/api/student/dashboard';
        const scheduleEndpoint = isGuardian ? '/api/guardian/my-schedule' : '/api/student/my-schedule';
        // --- THE DEFINITIVE FIX ---
        // Guardians now use their own dedicated, protected announcements endpoint.
        const announcementsEndpoint = isGuardian ? '/api/guardian/announcements' : '/announcements';

        const fetchData = async () => {
            setLoading(true);
            try {
                const startOfWeek = getStartOfWeek(new Date()).toISOString();
                const [dashboardRes, announcementsRes, scheduleRes] = await Promise.all([
                    axiosPrivate.get(dashboardEndpoint),
                    axiosPrivate.get(announcementsEndpoint),
                    axiosPrivate.get(scheduleEndpoint, { params: { weekStartDate: startOfWeek } })
                ]);
                setDashboardData(dashboardRes.data);
                setAnnouncements(announcementsRes.data);
                
                const day = getDayOfWeek();
                if (scheduleRes.data?.schedule?.[day]) {
                    const now = new Date();
                    const nowInMinutes = now.getHours() * 60 + now.getMinutes();
                    const upcoming = scheduleRes.data.schedule[day]
                        .filter((p: any) => {
                            if (!p.endTime) return true;
                            const [endHours, endMinutes] = p.endTime.split(':').map(Number);
                            if (isNaN(endHours) || isNaN(endMinutes)) return true;
                            const periodEndInMinutes = endHours * 60 + endMinutes;
                            return periodEndInMinutes > nowInMinutes;
                        })
                        .sort((a: any, b: any) => a.period - b.period);
                    setTodaysClasses(upcoming);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [axiosPrivate, isGuardian]);

    if (loading) { return <Center style={{ height: '50vh' }}><Loader /></Center>; }

    const welcomeName = isGuardian ? auth.user?.studentName : auth.user?.fullName;

    return (
        <>
            <Title order={2}>Welcome, {isGuardian ? 'Guardian' : welcomeName}!</Title>
            <Text c="dimmed" size="sm" mt={4}>Here's a summary of {isGuardian ? `${welcomeName}'s` : 'your'} academic status.</Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
                <StatCard title="Current Class" value={dashboardData?.currentClass || 'N/A'} />
                <Paper withBorder p="md" radius="md" shadow="sm">
                    <Group><RingProgress size={80} roundCaps thickness={8} sections={[{ value: dashboardData?.attendancePercentage || 0, color: 'teal' }]} label={<Text c="teal" fw={700} ta="center" size="xl">{dashboardData?.attendancePercentage || 0}%</Text>} />
                        <div><Text c="dimmed" size="xs" tt="uppercase" fw={700}>Attendance</Text><Text fw={700} size="xl">Overall</Text></div>
                    </Group>
                </Paper>
            </SimpleGrid>
            <Grid mt="xl">
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                        <Title order={4} mb="md">Today's Remaining Classes</Title>
                        <Stack>
                            {todaysClasses.length > 0 ? todaysClasses.map(item => item.subject && (
                                <Card withBorder p="sm" key={`${item.subject?.name}-${item.period}`}>
                                    <Group justify="space-between">
                                        <Stack gap={0}><Text fw={500}>{item.subject?.name}</Text><Text size="sm" c="dimmed">{item.teacher?.fullName || 'N/A'}</Text></Stack>
                                        <Group><IconClock size={16} /><Text size="sm">{formatTime(item.startTime)} - {formatTime(item.endTime)}</Text></Group>
                                    </Group>
                                </Card>
                            )) : <Text c="dimmed">No more classes scheduled for today.</Text>}
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                        <Title order={4} mb="md">Important Announcements</Title>
                        <Stack>
                            {announcements.length > 0 ? (
                                announcements.map(announcement => (
                                    <Alert key={announcement._id} icon={<IconInfoCircle size="1.2rem" />} title={announcement.title} color="blue" variant="light">{announcement.content}<Text size="xs" c="dimmed" mt="xs">Posted by {announcement.author.fullName} on {new Date(announcement.createdAt).toLocaleDateString()}</Text></Alert>
                                ))
                            ) : (<Text c="dimmed" ta="center" p="md">No new announcements at this time.</Text>)}
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </>
    );
};
export default StudentDashboard;