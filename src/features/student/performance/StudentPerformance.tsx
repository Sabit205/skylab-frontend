import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

interface StudentPerformanceProps {
    isGuardian?: boolean;
}

const StudentPerformance = ({ isGuardian = false }: StudentPerformanceProps) => {
    const [history, setHistory] = useState<any[]>([]);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const endpoint = isGuardian ? '/api/guardian/my-performance' : '/api/student/my-performance';
        axiosPrivate.get(endpoint).then(res => setHistory(res.data));
    }, [axiosPrivate, isGuardian]);

    const rows = history.map(item => (
        <Table.Tr key={item._id}>
            <Table.Td>{new Date(item.date).toLocaleDateString()}</Table.Td>
            <Table.Td>{item.subject?.name || 'N/A'}</Table.Td>
            <Table.Td>{item.teacher?.fullName || 'N/A'}</Table.Td>
            <Table.Td>{item.rating}</Table.Td>
            <Table.Td>{item.comment || '-'}</Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">Performance History</Title>
            <Paper withBorder p="md" radius="md">
                <Table>
                    <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>Subject</Table.Th><Table.Th>Teacher</Table.Th><Table.Th>Rating</Table.Th><Table.Th>Comment</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}><Text c="dimmed" ta="center">No performance records found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
                </Table>
            </Paper>
        </>
    );
};
export default StudentPerformance;