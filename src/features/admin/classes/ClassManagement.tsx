import { useState, useEffect } from 'react';
import { Table, Button, Group, Title, ActionIcon, Text, Modal, TextInput, Select, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

const schema = z.object({
    name: z.string().min(3, { message: 'Class name is required' }),
    teacher: z.string().min(1, { message: 'A teacher must be selected' }),
});

const ClassManagement = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const axiosPrivate = useAxiosPrivate();
    const form = useForm({ initialValues: { name: '', teacher: '' } });

    const fetchClasses = async () => {
        try {
            const response = await axiosPrivate.get('/classes');
            setClasses(response.data);
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch classes' });
        }
    };
    
    const fetchTeachers = async () => {
        try {
            const response = await axiosPrivate.get('/users?role=Teacher&fields=fullName');
            setTeachers(response.data.users.map((t: any) => ({ value: t._id, label: t.fullName })));
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch teachers' });
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    const handleSubmit = async () => {
        const result = schema.safeParse(form.values);
        if (!result.success) {
            form.setErrors(result.error.flatten().fieldErrors);
            return;
        }
        try {
            await axiosPrivate.post('/classes', result.data);
            notifications.show({ color: 'green', title: 'Success', message: 'Class created successfully' });
            close();
            form.reset();
            fetchClasses();
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to create class' });
        }
    };
    
    const openDeleteModal = (c: any) => modals.openConfirmModal({
        title: 'Delete Class',
        children: <Text size="sm">Are you sure you want to delete the class "{c.name}"?</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
            try {
                await axiosPrivate.delete(`/classes/${c._id}`);
                notifications.show({ color: 'red', title: 'Success', message: 'Class deleted' });
                fetchClasses();
            } catch (error) {
                 notifications.show({ color: 'red', title: 'Error', message: 'Failed to delete class' });
            }
        },
    });

    const rows = classes.map((item) => (
        <Table.Tr key={item._id}>
            <Table.Td>{item.name}</Table.Td>
            <Table.Td>{item.teacher?.fullName || <Text c="dimmed" fs="italic">Not Assigned</Text>}</Table.Td>
            <Table.Td>{new Date(item.createdAt).toLocaleDateString()}</Table.Td>
            <Table.Td><ActionIcon color="red" variant="light" onClick={() => openDeleteModal(item)}><IconTrash size={16} /></ActionIcon></Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Class Management</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={open}>Create Class</Button>
            </Group>
            <Paper withBorder p="md" radius="md">
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead><Table.Tr><Table.Th>Class Name</Table.Th><Table.Th>Assigned Teacher</Table.Th><Table.Th>Created At</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={4}><Text c="dimmed" ta="center" mt="xl">No classes found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
                </Table>
            </Paper>
            <Modal opened={opened} onClose={close} title="Create New Class">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <TextInput withAsterisk label="Class Name" placeholder="e.g., Grade 10 - Section A" {...form.getInputProps('name')} />
                    <Select withAsterisk label="Assign Teacher" placeholder="Select a teacher" data={teachers} {...form.getInputProps('teacher')} mt="md" searchable />
                    <Button type="submit" fullWidth mt="xl">Create Class</Button>
                </form>
            </Modal>
        </>
    );
};
export default ClassManagement;