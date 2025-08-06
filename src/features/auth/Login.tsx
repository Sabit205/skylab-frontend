import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Button,
    Text,
    Select,
    LoadingOverlay,
    Stack,
    Anchor,
    Group,
    Checkbox
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { axiosPrivate } from '../../api/axios'; // --- THE CRITICAL FIX: Use axiosPrivate ---
import useAuth from '../../hooks/useAuth';

const schema = z.object({
  role: z.enum(['Student', 'Teacher', 'Admin']),
  identifier: z.string().min(1, { message: 'This field is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const Login = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            role: 'Student' as 'Student' | 'Teacher' | 'Admin',
            identifier: '',
            password: '',
        },
    });

    const handleSubmit = async () => {
        const result = schema.safeParse(form.values);
        if (!result.success) {
            form.setErrors(result.error.flatten().fieldErrors);
            return;
        }

        setLoading(true);
        try {
            // We now use axiosPrivate for the login call. This ensures `withCredentials: true` is set,
            // which is essential for the backend to set the httpOnly cookie correctly in the browser.
            const response = await axiosPrivate.post('/auth/login', result.data);
            
            const { accessToken, user } = response.data;
            setAuth({ user, accessToken }); // Set the global auth state
            
            // Redirect based on role
            let redirectPath = '/';
            if (user.role === 'Admin') redirectPath = '/admin';
            else if (user.role === 'Teacher') redirectPath = '/teacher';
            else if (user.role === 'Student') redirectPath = '/student';

            navigate(from === '/' ? redirectPath : from, { replace: true });

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login Failed';
            notifications.show({ title: 'Login Error', message: errorMessage, color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const role = form.values.role;
    const identifierLabel = role === 'Student' ? 'Index Number' : 'Email';
    const identifierPlaceholder = role === 'Student' ? 'e.g., S12345' : 'your@email.com';

    return (
        <Stack mt="xl" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Stack gap="md">
                    <Select
                        label="I am a"
                        placeholder="Select your role"
                        data={['Student', 'Teacher', 'Admin']}
                        required
                        {...form.getInputProps('role')}
                    />
                    <TextInput
                        label={identifierLabel}
                        placeholder={identifierPlaceholder}
                        required
                        {...form.getInputProps('identifier')}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        required
                        {...form.getInputProps('password')}
                    />
                    <Group justify="space-between" mt="sm">
                        <Checkbox label="Remember me" />
                        <Anchor component="button" size="sm">
                            Forgot password?
                        </Anchor>
                    </Group>
                    <Button type="submit" fullWidth mt="md">
                        Sign in
                    </Button>
                </Stack>
            </form>
             <Text c="dimmed" size="sm" ta="center" mt="md">
                Don't have an account yet?{' '}
                <Link to="/signup">Create account</Link>
            </Text>
        </Stack>
    );
};

export default Login;