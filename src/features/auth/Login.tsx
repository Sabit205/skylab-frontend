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
import { axiosPrivate } from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const userSchema = z.object({
  identifier: z.string().min(1, { message: 'This field is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const guardianSchema = z.object({
  indexNumber: z.string().min(1, { message: 'Student Index Number is required' }),
  accessCode: z.string().min(1, { message: 'Guardian Access Code is required' }),
});

const Login = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            role: 'Student' as 'Student' | 'Teacher' | 'Admin' | 'Guardian',
            identifier: '',
            password: '',
            indexNumber: '',
            accessCode: '',
        },
    });

    const handleSubmit = async () => {
        const { role } = form.values;
        setLoading(true);

        try {
            let response;
            if (role === 'Guardian') {
                const result = guardianSchema.safeParse({ indexNumber: form.values.indexNumber, accessCode: form.values.accessCode });
                if (!result.success) {
                    form.setErrors(result.error.flatten().fieldErrors);
                    setLoading(false);
                    return;
                }
                response = await axiosPrivate.post('/api/guardian/login', result.data);
                localStorage.setItem('guardian-token', response.data.accessToken);
            } else {
                const result = userSchema.safeParse({ identifier: form.values.identifier, password: form.values.password });
                if (!result.success) {
                    form.setErrors(result.error.flatten().fieldErrors);
                    setLoading(false);
                    return;
                }
                response = await axiosPrivate.post('/auth/login', { ...result.data, role });
                localStorage.removeItem('guardian-token');
            }

            const { accessToken, user } = response.data;
            setAuth({ user, accessToken });
            
            let redirectPath = '/';
            if (user.role === 'Admin') redirectPath = '/admin';
            else if (user.role === 'Teacher') redirectPath = '/teacher';
            else if (user.role === 'Student') redirectPath = '/student';
            else if (user.studentId) redirectPath = '/guardian/dashboard';

            navigate(from === '/' ? redirectPath : from, { replace: true });

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login Failed';
            notifications.show({ title: 'Login Error', message: errorMessage, color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const role = form.values.role;

    return (
        <Stack mt="xl" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Stack gap="md">
                    <Select
                        label="Login as"
                        placeholder="Select your role"
                        data={['Student', 'Teacher', 'Admin', 'Guardian']}
                        required
                        {...form.getInputProps('role')}
                    />
                    
                    {role === 'Guardian' ? (
                        <>
                            <TextInput label="Student's Index Number" placeholder="e.g., S12345" required {...form.getInputProps('indexNumber')} />
                            <TextInput label="Guardian Access Code" placeholder="Enter the code from school" required {...form.getInputProps('accessCode')} />
                        </>
                    ) : (
                        <>
                            <TextInput
                                label={role === 'Student' ? 'Index Number' : 'Email'}
                                placeholder={role === 'Student' ? 'e.g., S12345' : 'your@email.com'}
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
                                <Anchor component="button" size="sm">Forgot password?</Anchor>
                            </Group>
                        </>
                    )}
                    
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