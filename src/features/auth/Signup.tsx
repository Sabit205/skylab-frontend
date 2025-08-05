import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Title, Text, Select, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import axios from '../../api/axios';

const schema = z.object({
    role: z.enum(['Student', 'Teacher']),
    fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
    identifier: z.string().min(1, { message: 'This field is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});


const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            role: 'Student' as 'Student' | 'Teacher',
            fullName: '',
            identifier: '',
            password: '',
            confirmPassword: '',
        },
    });

    const handleSubmit = async () => {
        const result = schema.safeParse(form.values);
        if (!result.success) {
            form.setErrors(result.error.flatten().fieldErrors);
            return;
        }

        setLoading(true);
        const { fullName, password, role, identifier } = result.data;
        const payload = {
            fullName,
            password,
            role,
            ...(role === 'Student' ? { indexNumber: identifier } : { email: identifier })
        };
        
        try {
            const response = await axios.post('/auth/signup', payload);
            notifications.show({
                title: 'Registration Successful',
                message: response.data.message,
                color: 'green',
            });
            navigate('/login');
        } catch (err: any) {
             const errorMessage = err.response?.data?.message || 'Signup Failed';
            notifications.show({ title: 'Signup Error', message: errorMessage, color: 'red' });
        } finally {
            setLoading(false);
        }
    };
    
    const role = form.values.role;
    const identifierLabel = role === 'Student' ? 'Index Number' : 'Email Address';
    const identifierPlaceholder = role === 'Student' ? 'Enter your index number' : 'your@email.com';

    return (
        <>
            <LoadingOverlay visible={loading} />
            <Title ta="center">Create Account</Title>
             <Text c="dimmed" size="sm" ta="center" mt={5}>
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
            </Text>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Select
                    label="I want to register as a"
                    placeholder="Select your role"
                    data={['Student', 'Teacher']}
                    required
                    mt="md"
                    {...form.getInputProps('role')}
                />
                 <TextInput label="Full Name" placeholder="John Doe" required mt="md" {...form.getInputProps('fullName')} />
                 <TextInput label={identifierLabel} placeholder={identifierPlaceholder} required mt="md" {...form.getInputProps('identifier')} />
                 <PasswordInput label="Password" placeholder="Your password" required mt="md" {...form.getInputProps('password')} />
                 <PasswordInput label="Confirm Password" placeholder="Confirm password" required mt="md" {...form.getInputProps('confirmPassword')} />
                 <Button type="submit" fullWidth mt="xl">Sign up</Button>
            </form>
        </>
    );
};
export default Signup;