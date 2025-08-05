import { useState, useEffect } from 'react';
// Correctly import Text as MantineText to avoid conflicts
import { Table, ScrollArea, TextInput, Select, Pagination, Group, Button, Badge, ActionIcon, Title, Paper, Text as MantineText } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconSearch, IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import UserFormModal from './UserFormModal';

interface User {
    _id: string;
    fullName: string;
    email?: string;
    indexNumber?: string;
    role: 'Student' | 'Teacher' | 'Admin';
    status: 'Pending' | 'Approved';
}

const UserManagement = () => {
    // ... (rest of the component state is identical to previous version)
    const axiosPrivate = useAxiosPrivate();
    const [users, setUsers] = useState<User[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [activePage, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            const { data } = await axiosPrivate.get('/users', {
                params: { page: activePage, limit: 10, role: roleFilter, search: debouncedSearch },
            });
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to load user data', color: 'red' });
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activePage, roleFilter, debouncedSearch]);
    
    const handleFormSubmit = async (values: any) => {
        try {
            if (editingUser) {
                await axiosPrivate.put(`/users/${editingUser._id}`, values);
                notifications.show({ title: 'Success', message: 'User updated successfully', color: 'green' });
            } else {
                await axiosPrivate.post('/users', values);
                 notifications.show({ title: 'Success', message: 'User created successfully', color: 'green' });
            }
            closeModal();
            fetchUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Operation failed';
            notifications.show({ title: 'Error', message: errorMsg, color: 'red' });
        }
    };
    
    const openDeleteModal = (user: User) =>
        modals.openConfirmModal({
            title: 'Delete User',
            centered: true,
            // Use the aliased MantineText component here
            children: <MantineText size="sm">Are you sure you want to delete {user.fullName}? This action is irreversible.</MantineText>,
            labels: { confirm: 'Delete user', cancel: "Cancel" },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await axiosPrivate.delete(`/users/${user._id}`);
                    notifications.show({ title: 'Deleted', message: 'User has been deleted.', color: 'red' });
                    fetchUsers();
                } catch (error) {
                    notifications.show({ title: 'Error', message: 'Failed to delete user', color: 'red' });
                }
            },
        });

    const handleUpdateStatus = async (user: User, status: 'Approved' | 'Pending') => {
        try {
            await axiosPrivate.patch(`/users/${user._id}/status`, { status });
            notifications.show({ title: 'Success', message: `User status updated to ${status}`, color: 'green' });
            fetchUsers();
        } catch(error) {
             notifications.show({ title: 'Error', message: 'Failed to update status', color: 'red' });
        }
    }

    const rows = users.map((user) => (
        <Table.Tr key={user._id}>
            <Table.Td>{user.fullName}</Table.Td>
            <Table.Td>{user.email || user.indexNumber}</Table.Td>
            <Table.Td>{user.role}</Table.Td>
            <Table.Td>
                <Badge color={user.status === 'Approved' ? 'green' : 'orange'} variant="light">{user.status}</Badge>
            </Table.Td>
            <Table.Td>
                <Group gap="xs">
                    {user.status === 'Pending' && (
                        <Button size="xs" variant="light" color="green" onClick={() => handleUpdateStatus(user, 'Approved')}>Approve</Button>
                    )}
                    <ActionIcon variant="light" onClick={() => { setEditingUser(user); openModal(); }}><IconEdit size={16} /></ActionIcon>
                    <ActionIcon variant="light" color="red" onClick={() => openDeleteModal(user)}><IconTrash size={16} /></ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Group justify="space-between" mb="lg">
                 <Title order={2}>User Management</Title>
                 <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditingUser(null); openModal();}}>Create User</Button>
            </Group>
           
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <TextInput placeholder="Search..." leftSection={<IconSearch size={14} />} value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} style={{ flex: 1 }} />
                    <Select placeholder="Filter by role" data={['Student', 'Teacher', 'Admin']} value={roleFilter} onChange={setRoleFilter} clearable />
                </Group>
                <ScrollArea>
                    <Table miw={800} verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Full Name</Table.Th>
                                <Table.Th>Email / Index Number</Table.Th>
                                <Table.Th>Role</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}><MantineText c="dimmed" ta="center" mt="xl">No users found.</MantineText></Table.Td></Table.Tr>}</Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>
            
            <Group justify="center" mt="md">
                <Pagination total={totalPages} value={activePage} onChange={setPage} />
            </Group>
            
            <UserFormModal
                opened={modalOpened}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                user={editingUser}
            />
        </>
    );
};
export default UserManagement;