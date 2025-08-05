import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Title, Text, Select, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';

const schema = z.object({
  role: z.enum(['Student', 'Teacher', 'Admin']),
  identifier: z.string().min(1, { message: 'This field is required' }),
  password: z.string().min(6, { message: 'Password should have at least 6 characters' }),
});

const Login = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

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
            const response = await axiosPrivate.post('/auth/login', result.data, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            const { accessToken, user } = response.data;
            setAuth({ user, accessToken });
            
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
        <>
            <LoadingOverlay visible={loading} />
            <Title ta="center">Welcome back!</Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Do not have an account yet?{' '}
                <Link to="/signup">Create account</Link>
            </Text>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Select
                    label="I am a"
                    placeholder="Select your role"
                    data={['Student', 'Teacher', 'Admin']}
                    required
                    mt="md"
                    {...form.getInputProps('role')}
                />
                <TextInput
                    label={identifierLabel}
                    placeholder={identifierPlaceholder}
                    required
                    mt="md"
                    {...form.getInputProps('identifier')}
                />
                <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    required
                    mt="md"
                    {...form.getInputProps('password')}
                />
                <Button type="submit" fullWidth mt="xl">
                    Sign in
                </Button>
            </form>
        </>
    );
};
export default Login;