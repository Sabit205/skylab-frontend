import { useState, useEffect } from 'react';
import { Table, Button, Group, Title, ActionIcon, Text, Modal, TextInput, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

const schema = z.object({
    name: z.string().min(2, { message: 'Subject name is required' }),
    code: z.string().optional(),
});

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [editingSubject, setEditingSubject] = useState<any>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const axiosPrivate = useAxiosPrivate();
    const form = useForm({
        initialValues: { name: '', code: '' },
        validate: zodResolver(schema),
    });

    const fetchSubjects = async () => {
        const response = await axiosPrivate.get('/subjects');
        setSubjects(response.data);
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            if (editingSubject) {
                await axiosPrivate.put(`/subjects/${editingSubject._id}`, values);
                notifications.show({ color: 'green', title: 'Success', message: 'Subject updated successfully' });
            } else {
                await axiosPrivate.post('/subjects', values);
                notifications.show({ color: 'green', title: 'Success', message: 'Subject created successfully' });
            }
            close();
            form.reset();
            setEditingSubject(null);
            fetchSubjects();
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Operation failed' });
        }
    };
    
    const openDeleteModal = (subject: any) => modals.openConfirmModal({
        title: 'Delete Subject',
        children: <Text size="sm">Are you sure you want to delete "{subject.name}"?</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: async () => {
            await axiosPrivate.delete(`/subjects/${subject._id}`);
            fetchSubjects();
        },
    });
    
    const handleEditClick = (subject: any) => {
        setEditingSubject(subject);
        form.setValues(subject);
        open();
    };

    const handleCreateClick = () => {
        setEditingSubject(null);
        form.reset();
        open();
    };

    const rows = subjects.map((item) => (
        <Table.Tr key={item._id}>
            <Table.Td>{item.name}</Table.Td>
            <Table.Td>{item.code || 'N/A'}</Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <ActionIcon variant="light" onClick={() => handleEditClick(item)}><IconEdit size={16} /></ActionIcon>
                    <ActionIcon color="red" variant="light" onClick={() => openDeleteModal(item)}><IconTrash size={16} /></ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Subject Management</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={handleCreateClick}>Create Subject</Button>
            </Group>
            <Paper withBorder p="md" radius="md">
                <Table><Table.Thead><Table.Tr><Table.Th>Subject Name</Table.Th><Table.Th>Code</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{rows}</Table.Tbody></Table>
            </Paper>
            <Modal opened={opened} onClose={close} title={editingSubject ? 'Edit Subject' : 'Create Subject'}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput withAsterisk label="Subject Name" {...form.getInputProps('name')} />
                    <TextInput label="Subject Code (Optional)" {...form.getInputProps('code')} mt="md" />
                    <Button type="submit" fullWidth mt="xl">{editingSubject ? 'Update' : 'Create'}</Button>
                </form>
            </Modal>
        </>
    );
};
export default SubjectManagement;