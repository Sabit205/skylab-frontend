import { useState, useEffect } from 'react';
import { Title, Text, Paper, Alert, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const StudentDashboard = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await axiosPrivate.get('/announcements');
                setAnnouncements(response.data);
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            }
        };
        fetchAnnouncements();
    }, [axiosPrivate]);
    
    return (
        <div>
            <Title order={2}>Welcome, {auth.user?.fullName}!</Title>
            <Text c="dimmed" mt="sm">This is your personal dashboard. Your assigned courses and grades will appear here.</Text>

            <Paper withBorder p="lg" mt="xl">
                <Title order={4} mb="md">Announcements</Title>
                <Stack>
                {announcements.length > 0 ? (
                    announcements.map(ann => (
                         <Alert key={ann._id} icon={<IconInfoCircle size="1rem" />} title={ann.title} color="blue">
                            {ann.content}
                            <Text size="xs" c="dimmed" mt="xs">Posted by {ann.author.fullName} on {new Date(ann.createdAt).toLocaleDateString()}</Text>
                        </Alert>
                    ))
                ) : (
                    <Text c="dimmed">No new announcements.</Text>
                )}
                </Stack>
            </Paper>
        </div>
    );
};

export default StudentDashboard;