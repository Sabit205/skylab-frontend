import { useState, useEffect } from 'react';
import { Title, Text, Paper, Alert, Stack, Grid, Card, Group, Center, Loader } from '@mantine/core';
import { IconInfoCircle, IconClock } from '@tabler/icons-react';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { formatTime } from '../../../utils/timeUtils';
import { getStartOfWeek } from '../../../utils/dateUtils';

const getDayOfWeek = () => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();

const TeacherDashboard = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [remainingClasses, setRemainingClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.user?.id) return;
            setLoading(true);
            try {
                // Get the start of the current week to fetch the correct schedule
                const startOfWeek = getStartOfWeek(new Date()).toISOString();
                
                const [announcementRes, scheduleRes] = await Promise.all([
                    axiosPrivate.get('/announcements'),
                    // Use the single, reliable /my-schedule endpoint
                    axiosPrivate.get('/api/teacher/my-schedule', { params: { weekStartDate: startOfWeek }})
                ]);
                setAnnouncements(announcementRes.data);
                
                const day = getDayOfWeek();
                // Check if the schedule for today exists in the response
                if (scheduleRes.data?.schedule?.[day]) {
                    const now = new Date();
                    const nowInMinutes = now.getHours() * 60 + now.getMinutes();

                    // Filter to find remaining classes
                    const upcoming = scheduleRes.data.schedule[day]
                        .filter((p: any) => {
                            if (!p.endTime) return true;
                            const [endHours, endMinutes] = p.endTime.split(':').map(Number);
                            if (isNaN(endHours) || isNaN(endMinutes)) return true;
                            const periodEndInMinutes = endHours * 60 + endMinutes;
                            return periodEndInMinutes > nowInMinutes;
                        });
                    
                    setRemainingClasses(upcoming);
                }

            } catch (error) { 
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [axiosPrivate, auth.user?.id]);
    
    if (loading) return <Center><Loader/></Center>;

    return (
        <div>
            <Title order={2}>Welcome, {auth.user?.fullName}!</Title>
            <Text c="dimmed" mt="sm">Here is a summary of your day and recent announcements.</Text>
            <Grid mt="xl">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper withBorder p="lg" radius="md">
                        <Title order={4} mb="md">Today's Remaining Classes</Title>
                        <Stack>
                            {remainingClasses.length > 0 ? remainingClasses.map(item => (
                                <Card withBorder p="sm" key={`${item.className}-${item.period}`}>
                                    <Group justify="space-between">
                                        <Stack gap={0}><Text fw={500}>{item.subject?.name}</Text><Text size="sm" c="dimmed">{item.className}</Text></Stack>
                                        <Group><IconClock size={16} /><Text size="sm">{formatTime(item.startTime)} - {formatTime(item.endTime)}</Text></Group>
                                    </Group>
                                </Card>
                            )) : <Text c="dimmed">No more classes scheduled for today.</Text>}
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper withBorder p="lg" radius="md">
                        <Title order={4} mb="md">Announcements</Title>
                        <Stack>
                        {announcements.length > 0 ? announcements.map(ann => (
                             <Alert key={ann._id} icon={<IconInfoCircle size="1rem" />} title={ann.title} color="grape" variant="light">{ann.content}</Alert>
                        )) : <Text c="dimmed">No new announcements.</Text>}
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </div>
    );
};
export default TeacherDashboard;