import { useState, useEffect } from 'react';
import { Title, Table, Paper, Badge, Button, Text } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pending': return 'yellow';
        case 'GuardianApproved': return 'blue';
        case 'TeacherApproved': return 'green';
        case 'TeacherDeclined': return 'red';
        case 'RecalledByStudent': return 'gray';
        default: return 'gray';
    }
};

const PlannerHistory = () => {
    const [history, setHistory] = useState<any[]>([]);
    const axiosPrivate = useAxiosPrivate();

    const fetchHistory = () => {
        axiosPrivate.get('/api/student/daily-planner-history').then(res => setHistory(res.data));
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleRecall = (plannerId: string) => {
        modals.openConfirmModal({
            title: 'Recall Planner for Editing',
            children: <Text size="sm">Are you sure? This will delete the current submission and allow you to create a new one for this date. This can only be done before a guardian has approved it.</Text>,
            labels: { confirm: 'Yes, Recall', cancel: 'Cancel' },
            confirmProps: {color: 'orange'},
            onConfirm: async () => {
                try {
                    await axiosPrivate.patch(`/api/student/daily-planner/${plannerId}/recall`);
                    notifications.show({ color: 'teal', message: 'Planner recalled. You can now edit it again from the Daily Planner page.' });
                    fetchHistory();
                } catch(error: any) {
                    notifications.show({ color: 'red', title: 'Error', message: error.response?.data?.message || 'Could not recall planner.' });
                }
            },
        });
    };

    const rows = history.map(item => (
        <Table.Tr key={item._id}>
            <Table.Td>{new Date(item.date).toLocaleDateString()}</Table.Td>
            <Table.Td><Badge color={getStatusColor(item.status)}>{item.status.replace(/([A-Z])/g, ' $1').trim()}</Badge></Table.Td>
            <Table.Td>{item.teacherDeclineComment || '-'}</Table.Td>
            <Table.Td>
                {item.status === 'Pending' && (
                    <Button variant="light" color="orange" size="xs" onClick={() => handleRecall(item._id)}>Recall</Button>
                )}
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">Planner Submission History</Title>
            <Paper withBorder p="md" radius="md">
                <Table>
                    <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>Status</Table.Th><Table.Th>Teacher's Comment</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Paper>
        </>
    );
};
export default PlannerHistory;