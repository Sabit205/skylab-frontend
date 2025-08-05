import { Modal, TextInput, Select, PasswordInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

interface User {
    _id?: string;
    fullName: string;
    email?: string;
    indexNumber?: string;
    role: 'Student' | 'Teacher' | 'Admin';
    status?: 'Pending' | 'Approved';
    class?: string;
}

interface UserFormModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    user: User | null;
}

const UserFormModal = ({ opened, onClose, onSubmit, user }: UserFormModalProps) => {
    const isEditMode = !!user;
    const axiosPrivate = useAxiosPrivate();
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axiosPrivate.get('/classes');
                setClasses(response.data.map((c: any) => ({ value: c._id, label: c.name })));
            } catch (error) { console.error("Failed to fetch classes for form", error); }
        };
        if (opened) fetchClasses();
    }, [opened, axiosPrivate]);
    
    const schema = z.object({
        fullName: z.string().min(3, { message: 'Full name is required' }),
        role: z.enum(['Student', 'Teacher', 'Admin']),
        identifier: z.string().min(1, { message: 'Identifier is required' }),
        password: isEditMode
            ? z.string().optional().refine(val => val === '' || (val && val.length >= 6), {
                message: 'Password must be at least 6 characters'
            })
            : z.string().min(6, { message: 'Password must be at least 6 characters' }),
        class: z.string().optional(),
    }).refine((data) => data.role !== 'Student' || !!data.class, {
        message: 'Class is required for students',
        path: ['class'],
    });

    const form = useForm({
        initialValues: {
            fullName: '', role: 'Student' as 'Student' | 'Teacher' | 'Admin', identifier: '', password: '', class: '',
        },
    });
    
    useEffect(() => {
        if (user) {
            form.setValues({
                fullName: user.fullName, role: user.role, identifier: user.email || user.indexNumber || '', password: '', class: user.class || '',
            });
        } else {
            form.reset();
        }
    }, [user, opened]);

    const handleSubmit = () => {
        const result = schema.safeParse(form.values);
        if (!result.success) {
            form.setErrors(result.error.flatten().fieldErrors);
            return;
        }
        
        const { fullName, role, identifier, password, class: classId } = result.data;
        const payload = {
            fullName, role,
            ...(role === 'Student' ? { indexNumber: identifier, class: classId } : { email: identifier }),
            ...(password && { password }),
        };
        onSubmit(payload);
    };

    return (
        <Modal opened={opened} onClose={onClose} title={isEditMode ? 'Edit User' : 'Create New User'}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <TextInput label="Full Name" required {...form.getInputProps('fullName')} />
                <Select label="Role" data={['Student', 'Teacher', 'Admin']} required mt="md" {...form.getInputProps('role')} />
                <TextInput label={form.values.role === 'Student' ? 'Index Number' : 'Email'} required mt="md" {...form.getInputProps('identifier')} />
                {form.values.role === 'Student' && (
                    <Select label="Class" placeholder="Assign a class" data={classes} required searchable mt="md" {...form.getInputProps('class')} />
                )}
                <PasswordInput label="Password" placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter new password'} required={!isEditMode} mt="md" {...form.getInputProps('password')} />
                <Group justify="flex-end" mt="xl"><Button variant="default" onClick={onClose}>Cancel</Button><Button type="submit">{isEditMode ? 'Update User' : 'Create User'}</Button></Group>
            </form>
        </Modal>
    );
};
export default UserFormModal;