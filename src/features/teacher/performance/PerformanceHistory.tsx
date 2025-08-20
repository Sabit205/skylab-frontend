import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const PerformanceHistory = () => {
    const [history, setHistory] = useState<any[]>([]);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        axiosPrivate.get('/api/teacher/performance-history').then(res => setHistory(res.data));
    }, [axiosPrivate]);

    const rows = history.map(item => (
        <Table.Tr key={item._id}>
            <Table.Td>{new Date(item.date).toLocaleDateString()}</Table.Td>
            {/* --- THE DEFINITIVE FIX IS HERE --- */}
            {/* Safely access properties using optional chaining (?.) and provide a fallback */}
            <Table.Td>{item.student?.fullName || 'Deleted Student'}</Table.Td>
            <Table.Td>{item.class?.name || 'Deleted Class'}</Table.Td>
            <Table.Td>{item.subject?.name || 'Deleted Subject'}</Table.Td>
            <Table.Td>{item.rating}</Table.Td>
            <Table.Td>{item.comment || 'N/A'}</Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">Performance Submission History</Title>
            <Paper withBorder p="md" radius="md">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Student</Table.Th>
                            <Table.Th>Class</Table.Th>
                            <Table.Th>Subject</Table.Th>
                            <Table.Th>Rating</Table.Th>
                            <Table.Th>Comment</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Paper>
        </>
    );
};
export default PerformanceHistory;