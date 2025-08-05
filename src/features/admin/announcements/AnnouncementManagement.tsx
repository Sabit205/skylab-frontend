import { useState, useEffect } from 'react';
import { Table, Button, Group, Title, ActionIcon, Text, Modal, TextInput, Select, Textarea, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

// --- THE DEFINITIVE FIX ---
// The problematic options object has been removed from z.enum.
// Zod will now use its default error message, which is perfectly fine.
const schema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
    content: z.string().min(10, { message: 'Content must be at least 10 characters long.' }),
    targetRole: z.enum(['All', 'Student', 'Teacher']),
});

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    
    const form = useForm({
        initialValues: {
            title: '',
            content: '',
            targetRole: 'All' as 'All' | 'Student' | 'Teacher',
        },
    });

    const fetchAnnouncements = async () => {
        try {
            const response = await axiosPrivate.get('/announcements');
            setAnnouncements(response.data);
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch announcements' });
        }
    };
    
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const result = schema.safeParse(form.values);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            const mantineErrors: Record<string, string> = {};
            Object.keys(fieldErrors).forEach((key) => {
                const errorKey = key as keyof typeof fieldErrors;
                if (fieldErrors[errorKey]) {
                    mantineErrors[errorKey] = fieldErrors[errorKey]![0];
                }
            });
            form.setErrors(mantineErrors);
            setIsSubmitting(false);
            return;
        }
        
        try {
            await axiosPrivate.post('/announcements', result.data);
            notifications.show({ color: 'green', title: 'Success', message: 'Announcement posted' });
            close();
            form.reset();
            fetchAnnouncements();
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to post announcement' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const openDeleteModal = (a: any) => modals.openConfirmModal({
        title: 'Delete Announcement',
        children: <Text size="sm">Are you sure you want to delete this announcement?</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
            try {
                await axiosPrivate.delete(`/announcements/${a._id}`);
                notifications.show({ color: 'red', message: 'Announcement deleted.' });
                fetchAnnouncements();
            } catch (error) {
                 notifications.show({ color: 'red', title: 'Error', message: 'Failed to delete announcement.' });
            }
        },
    });

    const rows = announcements.map((item) => (
        <Table.Tr key={item._id}>
            <Table.Td>{item.title}</Table.Td>
            <Table.Td>{item.targetRole}</Table.Td>
            <Table.Td>{new Date(item.createdAt).toLocaleString()}</Table.Td>
            <Table.Td><ActionIcon color="red" variant="light" onClick={() => openDeleteModal(item)}><IconTrash size={16} /></ActionIcon></Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Announcements</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={open}>New Announcement</Button>
            </Group>
            <Paper withBorder p="md" radius="md">
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead><Table.Tr><Table.Th>Title</Table.Th><Table.Th>Target Audience</Table.Th><Table.Th>Date Posted</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={4}><Text c="dimmed" ta="center" mt="xl">No announcements found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
                </Table>
            </Paper>
            <Modal opened={opened} onClose={close} title="New Announcement" centered>
                <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
                    <TextInput withAsterisk label="Title" placeholder='Exam Schedule' {...form.getInputProps('title')} />
                    <Textarea withAsterisk label="Content" placeholder='Details about the upcoming exams...' minRows={4} {...form.getInputProps('content')} mt="md" />
                    <Select withAsterisk label="Target Audience" data={['All', 'Student', 'Teacher']} {...form.getInputProps('targetRole')} mt="md" />
                    <Button type="submit" fullWidth mt="xl" loading={isSubmitting}>Post Announcement</Button>
                </form>
            </Modal>
        </>
    );
};
export default AnnouncementManagement;