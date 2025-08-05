import { useState, useEffect } from 'react';
import { Title, Paper, Avatar, Text, Group, TextInput, Button } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';

const StudentProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [phone, setPhone] = useState('');
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        axiosPrivate.get('/api/student/my-profile').then(res => {
            setProfile(res.data);
            setPhone(res.data.phone || '');
        });
    }, [axiosPrivate]);

    const handleUpdate = () => {
        axiosPrivate.put('/api/student/my-profile', { phone })
            .then(res => {
                setProfile(res.data);
                notifications.show({ color: 'green', title: 'Success', message: 'Profile updated!' });
            })
            .catch(() => notifications.show({ color: 'red', title: 'Error', message: 'Failed to update profile' }));
    };

    if (!profile) return null;

    return (
        <>
            <Title order={2} mb="lg">My Profile</Title>
            <Paper withBorder p="xl" radius="md">
                <Group>
                    <Avatar size="xl" radius="xl" />
                    <div>
                        <Title order={3}>{profile.fullName}</Title>
                        <Text c="dimmed">Role: {profile.role}</Text>
                    </div>
                </Group>
                <Group mt="xl">
                    <Text fw={500}>Index Number:</Text><Text>{profile.indexNumber}</Text>
                </Group>
                <Group>
                    <Text fw={500}>Class:</Text><Text>{profile.class?.name || 'N/A'}</Text>
                </Group>
                <TextInput label="Phone Number" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} mt="md" />
                <Button onClick={handleUpdate} mt="xl">Update Profile</Button>
            </Paper>
        </>
    );
};
export default StudentProfile;