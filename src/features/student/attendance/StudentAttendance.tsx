import { useState, useEffect } from 'react';
import { Title, Paper, Table, Group } from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconClock } from '@tabler/icons-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const ICONS: Record<string, React.ReactNode> = { Present: <IconCircleCheck color="green" />, Absent: <IconCircleX color="red" />, Late: <IconClock color="orange" /> };
const COLORS: Record<string, string> = { Present: '#2f9e44', Absent: '#e03131', Late: '#f59f00' };

const StudentAttendance = () => {
    const [history, setHistory] = useState<any[]>([]);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        axiosPrivate.get('/api/student/my-attendance').then(res => setHistory(res.data));
    }, [axiosPrivate]);
    
    const attendanceSummary = history.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(attendanceSummary).map(key => ({ name: key, value: attendanceSummary[key] }));

    const rows = history.map(item => (
        <Table.Tr key={item._id}>
            <Table.Td>{new Date(item.date).toLocaleDateString()}</Table.Td>
            <Table.Td><Group gap="xs">{ICONS[item.status]} {item.status}</Group></Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">My Attendance History</Title>
            <Group align="flex-start">
                <Paper withBorder p="md" radius="md" style={{ flex: 1 }}>
                    <Table verticalSpacing="sm">
                        <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Title order={4} mb="md" ta="center">Monthly Summary</Title>
                    <ResponsiveContainer width={300} height={300}>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {chartData.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} /> ))}
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Group>
        </>
    );
};
export default StudentAttendance;