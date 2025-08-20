import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, LoadingOverlay, Stack, Text, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { axiosPrivate } from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const schema = z.object({
    indexNumber: z.string().min(1, { message: 'Student Index Number is required' }),
    accessCode: z.string().min(1, { message: 'Guardian Access Code is required' }),
});

const GuardianLogin = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const form = useForm({
        initialValues: { indexNumber: '', accessCode: '' },
        validate: zodResolver(schema),
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            const response = await axiosPrivate.post('/api/guardian/login', values);
            const { accessToken, user } = response.data;
            setAuth({ user, accessToken });
            navigate('/guardian/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login Failed';
            notifications.show({ title: 'Login Error', message: errorMessage, color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack mt="xl" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput label="Student's Index Number" placeholder="e.g., S12345" required {...form.getInputProps('indexNumber')} />
                    <TextInput label="Guardian Access Code" placeholder="Enter the code provided by the school" required {...form.getInputProps('accessCode')} />
                    <Button type="submit" fullWidth mt="md">Sign in as Guardian</Button>
                </Stack>
            </form>
            <Text c="dimmed" size="sm" ta="center" mt="md">
                Are you a Student or Teacher?{' '}
                <Anchor component={Link} to="/login">Login Here</Anchor>
            </Text>
        </Stack>
    );
};
export default GuardianLogin;