import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { Title, Text, SimpleGrid, Paper, Group, RingProgress, Stack, Alert, Loader, Center } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

// A small, reusable component for displaying dashboard stats
const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <Paper withBorder p="md" radius="md" shadow="sm">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
        <Text fw={700} size="xl">{value}</Text>
    </Paper>
);

const StudentDashboard = () => {
    const { auth } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    // NEW: State to hold announcements
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        // We use Promise.all to fetch dashboard stats and announcements concurrently for better performance.
        const fetchData = async () => {
            setLoading(true);
            try {
                const [dashboardRes, announcementsRes] = await Promise.all([
                    axiosPrivate.get('/api/student/dashboard'),
                    axiosPrivate.get('/announcements') // This endpoint is already role-aware
                ]);
                setDashboardData(dashboardRes.data);
                setAnnouncements(announcementsRes.data);
            } catch (error) {
                console.error("Failed to fetch student dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [axiosPrivate]);

    if (loading) {
        return <Center style={{ height: '50vh' }}><Loader /></Center>;
    }

    return (
        <>
            <Title order={2}>Welcome, {auth.user?.fullName}!</Title>
            <Text c="dimmed" size="sm" mt={4}>Here's a summary of your academic status.</Text>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mt="xl">
                <StatCard title="Current Class" value={dashboardData?.currentClass || 'N/A'} />
                <Paper withBorder p="md" radius="md" shadow="sm">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: dashboardData?.attendancePercentage || 0, color: 'teal' }]}
                            label={<Text c="teal" fw={700} ta="center" size="xl">{dashboardData?.attendancePercentage || 0}%</Text>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Attendance</Text>
                            <Text fw={700} size="xl">Overall</Text>
                        </div>
                    </Group>
                </Paper>
                <StatCard title="Upcoming Class" value="Maths" /> 
                <StatCard title="Latest Result" value={dashboardData?.latestResult?.examType || 'Not Published'} />
            </SimpleGrid>

            {/* --- NEW ANNOUNCEMENT SECTION --- */}
            <Paper withBorder p="lg" radius="md" shadow="sm" mt="xl">
                <Title order={4} mb="md">Important Announcements</Title>
                <Stack>
                    {announcements.length > 0 ? (
                        announcements.map(announcement => (
                            <Alert 
                                key={announcement._id} 
                                icon={<IconInfoCircle size="1.2rem" />} 
                                title={announcement.title} 
                                color="blue" 
                                variant="light"
                            >
                                {announcement.content}
                                <Text size="xs" c="dimmed" mt="xs">
                                    Posted by {announcement.author.fullName} on {new Date(announcement.createdAt).toLocaleDateString()}
                                </Text>
                            </Alert>
                        ))
                    ) : (
                        <Text c="dimmed" ta="center" p="md">
                            No new announcements at this time.
                        </Text>
                    )}
                </Stack>
            </Paper>
        </>
    );
};

export default StudentDashboard;