import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Button,
    Text,
    Select,
    LoadingOverlay,
    Popover,
    Progress,
    Stack,
    Group
} from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import axios from '../../api/axios';

// A small component to render each password requirement
function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
      // FIX: The outer <Text> component now renders as a <div> to prevent nesting errors.
      <Text component="div" c={meets ? 'teal' : 'red'} mt={5} size="sm">
        <Group gap="xs">
            {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
            <span>{label}</span>
        </Group>
      </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 7 ? 0 : 1;
    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });
    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

// Zod schema for form validation
const schema = z.object({
    role: z.enum(['Student', 'Teacher']),
    fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
    identifier: z.string().min(1, { message: 'This field is required' }),
    // FIX: Changed `classId` to `class` to match the rest of the application's data structure.
    class: z.string().optional(),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .refine((val) => requirements.every(req => req.re.test(val)), {
            message: 'Password does not meet all requirements'
        }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).refine((data) => data.role !== 'Student' || !!data.class, {
    message: 'Please select a class.',
    path: ['class'],
});

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);

    const form = useForm({
        initialValues: {
            role: 'Student' as 'Student' | 'Teacher',
            fullName: '',
            identifier: '',
            class: '', // Use 'class' to match the schema
            password: '',
            confirmPassword: '',
        },
    });
    
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get('/classes');
                setClasses(response.data.map((c: any) => ({ value: c._id, label: c.name })));
            } catch (error) {
                console.error("Failed to fetch classes for signup form", error);
                notifications.show({
                    color: 'red',
                    title: 'Error',
                    message: 'Could not load class list. Please try again later.'
                });
            }
        };
        fetchClasses();
    }, []);

    const strength = getStrength(form.values.password);
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(form.values.password)} />
    ));

    const handleSubmit = async () => {
        const result = schema.safeParse(form.values);
        if (!result.success) {
            form.setErrors(result.error.flatten().fieldErrors);
            return;
        }

        setLoading(true);
        const { fullName, password, role, identifier, class: classId } = result.data;
        
        const payload: any = { fullName, password, role };
        
        if (role === 'Student') {
            payload.indexNumber = identifier;
            payload.class = classId;
        } else {
            payload.email = identifier;
        }
        
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
        <Stack mt="xl" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Stack gap="md">
                    <Select
                        label="I want to register as a"
                        placeholder="Select your role"
                        data={['Student', 'Teacher']}
                        required
                        {...form.getInputProps('role')}
                    />
                    <TextInput label="Full Name" placeholder="John Doe" required {...form.getInputProps('fullName')} />
                    <TextInput label={identifierLabel} placeholder={identifierPlaceholder} required {...form.getInputProps('identifier')} />
                    
                    {role === 'Student' && (
                        <Select
                            label="Select your Class"
                            placeholder="Pick your class"
                            data={classes}
                            required
                            searchable
                            {...form.getInputProps('class')}
                        />
                    )}
                    
                    <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
                        <Popover.Target>
                            <div onFocusCapture={() => setPopoverOpened(true)} onBlurCapture={() => setPopoverOpened(false)}>
                                <PasswordInput
                                    label="Password"
                                    placeholder="Your password"
                                    required
                                    {...form.getInputProps('password')}
                                />
                            </div>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Progress color={strength === 100 ? 'teal' : 'red'} value={strength} size={5} mb="xs" />
                            <PasswordRequirement label="Includes at least 8 characters" meets={form.values.password.length > 7} />
                            {checks}
                        </Popover.Dropdown>
                    </Popover>

                    <PasswordInput label="Confirm Password" placeholder="Confirm password" required {...form.getInputProps('confirmPassword')} />
                    <Button type="submit" fullWidth mt="md">
                        Create Account
                    </Button>
                </Stack>
            </form>
            <Text c="dimmed" size="sm" ta="center" mt="md">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
            </Text>
        </Stack>
    );
};

export default Signup;