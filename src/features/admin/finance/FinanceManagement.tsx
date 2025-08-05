import { useState, useEffect } from 'react';
import { Table, Button, Group, Title, ActionIcon, Text, Paper, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconReceipt, IconReportMoney, IconEdit } from '@tabler/icons-react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import TransactionFormModal from './TransactionFormModal';

const FinanceManagement = () => {
    const [revenue, setRevenue] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const axiosPrivate = useAxiosPrivate();

    const fetchTransactions = async () => {
        try {
            const [revenueRes, expensesRes] = await Promise.all([
                axiosPrivate.get('/finance?type=Revenue'),
                axiosPrivate.get('/finance?type=Expense')
            ]);
            setRevenue(revenueRes.data);
            setExpenses(expensesRes.data);
        } catch (error) {
             notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch transactions' });
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleFormSubmit = async (values: any) => {
        try {
            if (editingTransaction) {
                await axiosPrivate.put(`/finance/${(editingTransaction as any)._id}`, values);
                notifications.show({ color: 'green', title: 'Success', message: 'Transaction updated' });
            } else {
                await axiosPrivate.post('/finance', values);
                notifications.show({ color: 'green', title: 'Success', message: 'Transaction added' });
            }
            closeModal();
            setEditingTransaction(null);
            fetchTransactions();
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to save transaction' });
        }
    };
    
    const openDeleteModal = (t: any) => modals.openConfirmModal({
        title: `Delete ${t.type}`,
        children: <Text size="sm">Are you sure you want to delete this transaction?</Text>,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
            await axiosPrivate.delete(`/finance/${t._id}`);
            notifications.show({ color: 'red', message: 'Transaction deleted' });
            fetchTransactions();
        },
    });

    const createTable = (data: any[]) => data.map((item) => (
        <Table.Tr key={item._id}>
            <Table.Td>{item.category}</Table.Td>
            <Table.Td>৳{item.amount.toLocaleString()}</Table.Td>
            <Table.Td>{new Date(item.date).toLocaleDateString()}</Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <ActionIcon variant="light" onClick={() => { setEditingTransaction(item); openModal(); }}><IconEdit size={16} /></ActionIcon>
                    <ActionIcon color="red" variant="light" onClick={() => openDeleteModal(item)}><IconTrash size={16} /></ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Financial Management</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditingTransaction(null); openModal(); }}>Add Transaction</Button>
            </Group>

            <Tabs defaultValue="revenue">
                <Tabs.List grow>
                    <Tabs.Tab value="revenue" leftSection={<IconReportMoney size={16} />}>Revenue</Tabs.Tab>
                    <Tabs.Tab value="expenses" leftSection={<IconReceipt size={16} />}>Expenses</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="revenue" pt="xs"><Paper withBorder p="md" radius="md"><Table><Table.Thead><Table.Tr><Table.Th>Category</Table.Th><Table.Th>Amount</Table.Th><Table.Th>Date</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{createTable(revenue)}</Table.Tbody></Table></Paper></Tabs.Panel>
                <Tabs.Panel value="expenses" pt="xs"><Paper withBorder p="md" radius="md"><Table><Table.Thead><Table.Tr><Table.Th>Category</Table.Th><Table.Th>Amount</Table.Th><Table.Th>Date</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{createTable(expenses)}</Table.Tbody></Table></Paper></Tabs.Panel>
            </Tabs>
            
            <TransactionFormModal opened={modalOpened} onClose={closeModal} onSubmit={handleFormSubmit} transaction={editingTransaction} />
        </>
    );
};

export default FinanceManagement;