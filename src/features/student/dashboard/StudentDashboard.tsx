import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { Title, Text, SimpleGrid, Paper, Group, RingProgress, Stack, Alert, Loader, Center } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

// Helper function to find the next class based on the current time
const getNextClass = (schedule: any) => {
    if (!schedule) return 'N/A';
    
    const now = new Date();
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now).toLowerCase();
    const currentHour = now.getHours();

    // Assuming a simple time structure for periods (e.g., Period 1 is at 8 AM, Period 2 at 9 AM, etc.)
    // You can make this more complex if you have specific start/end times
    const periodTimes: { [key: number]: number } = { 1: 8, 2: 9, 3: 10, 4: 11, 5: 13, 6: 14, 7: 15, 8: 16 };

    const todaysPeriods = schedule[dayOfWeek];
    if (!todaysPeriods || todaysPeriods.length === 0) {
        return 'No classes today';
    }

    // Find the first period that is scheduled for a later hour than the current time
    for (const period of todaysPeriods.sort((a: any, b: any) => a.period - b.period)) {
        if (period.subject && periodTimes[period.period] > currentHour) {
            return `${period.subject} (P${period.period})`;
        }
    }

    return 'No more classes today';
};


// A small, reusable component for displaying dashboard stats
const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <Paper withBorder p="md" radius="md" shadow="sm">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
        <Text fw={700} size="xl" truncate>{value}</Text>
    </Paper>
);

const StudentDashboard = () => {
    const { auth } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    // NEW: State to hold the student's personal schedule
    const [schedule, setSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all necessary data in parallel for performance
                const [dashboardRes, announcementsRes, scheduleRes] = await Promise.all([
                    axiosPrivate.get('/api/student/dashboard'),
                    axiosPrivate.get('/announcements'),
                    axiosPrivate.get('/api/student/my-schedule') // Fetch the personal schedule
                ]);
                setDashboardData(dashboardRes.data);
                setAnnouncements(announcementsRes.data);
                setSchedule(scheduleRes.data?.schedule); // Set the schedule state
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

    // Determine the next class using our helper function
    const upcomingClass = getNextClass(schedule);

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
                
                {/* --- THE DEFINITIVE FIX --- */}
                {/* This card now displays the dynamic, correct upcoming class */}
                <StatCard title="Upcoming Class" value={upcomingClass} /> 
                
                <StatCard title="Latest Result" value={dashboardData?.latestResult?.examType || 'Not Published'} />
            </SimpleGrid>

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