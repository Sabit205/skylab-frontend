import { useState, useEffect } from 'react';
import { Title, Text, Paper, Alert, Stack, Grid, Card, Group } from '@mantine/core';
import { IconInfoCircle, IconClock } from '@tabler/icons-react';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const getDayOfWeek = () => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();

const TeacherDashboard = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.user?.id) return;
            try {
                const [announcementRes, scheduleRes] = await Promise.all([
                    axiosPrivate.get('/announcements'),
                    axiosPrivate.get('/api/teacher/my-schedule')
                ]);
                setAnnouncements(announcementRes.data);
                
                const day = getDayOfWeek();
                const todaysClasses = scheduleRes.data.filter((p: any) => p.day === day)
                    .sort((a:any, b:any) => a.period - b.period);
                setTodaySchedule(todaysClasses);

            } catch (error) { console.error("Failed to fetch dashboard data", error); }
        };
        fetchData();
    }, [axiosPrivate, auth.user?.id]);
    
    return (
        <div>
            <Title order={2}>Welcome, {auth.user?.fullName}!</Title>
            <Text c="dimmed" mt="sm">Here is a summary of your day and recent announcements.</Text>
            <Grid mt="xl">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper withBorder p="lg">
                        <Title order={4} mb="md">Today's Classes</Title>
                        <Stack>
                            {todaySchedule.length > 0 ? todaySchedule.map(item => (
                                <Card withBorder p="sm" key={`${item.className}-${item.period}`}>
                                    <Group justify="space-between">
                                        <Stack gap={0}><Text fw={500}>{item.subject}</Text><Text size="sm" c="dimmed">{item.className}</Text></Stack>
                                        <Group><IconClock size={16} /><Text size="sm">Period {item.period}</Text></Group>
                                    </Group>
                                </Card>
                            )) : <Text c="dimmed">You have no classes scheduled for today.</Text>}
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper withBorder p="lg">
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