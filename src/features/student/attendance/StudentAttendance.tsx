import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text, Group } from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconClock } from '@tabler/icons-react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const ICONS: Record<string, React.ReactNode> = { Present: <IconCircleCheck color="green" />, Absent: <IconCircleX color="red" />, Late: <IconClock color="orange" /> };
const COLORS: Record<string, string> = { Present: '#2f9e44', Absent: '#e03131', Late: '#f59f00' };

interface StudentAttendanceProps {
    isGuardian?: boolean;
}

// --- THIS IS THE DEFINITIVE FIX FOR THE CHART ---

// A custom label renderer for the Pie Chart.
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    // Only render the label if the slice is large enough (e.g., > 5%) to avoid clutter.
    if (percent < 0.05) {
        return null;
    }
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const StudentAttendance = ({ isGuardian = false }: StudentAttendanceProps) => {
    const [history, setHistory] = useState<any[]>([]);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const endpoint = isGuardian ? '/api/guardian/my-attendance' : '/api/student/my-attendance';
        axiosPrivate.get(endpoint).then(res => setHistory(res.data));
    }, [axiosPrivate, isGuardian]);
    
    const attendanceSummary = history.reduce((acc, curr) => {
        if (curr.status) { // Only count if status is not null/undefined
            acc[curr.status] = (acc[curr.status] || 0) + 1;
        }
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
            <Title order={2} mb="lg">Attendance History</Title>
            <Group align="flex-start">
                <Paper withBorder p="md" radius="md" style={{ flex: 1 }}>
                    <Table verticalSpacing="sm">
                        <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
                        <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={2}><Text c="dimmed" ta="center">No attendance history found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
                    </Table>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Title order={4} mb="md" ta="center">Overall Summary</Title>
                    <PieChart width={300} height={300}>
                        <Pie 
                            data={chartData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={80} 
                            labelLine={false}
                            label={renderCustomizedLabel}
                            // Adding cornerRadius helps fix the white line artifact
                            cornerRadius={5}
                            // Disabling animation for single-segment charts prevents initial render glitches
                            isAnimationActive={chartData.length > 1}
                        >
                            {chartData.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} stroke={COLORS[entry.name]} /> ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </Paper>
            </Group>
        </>
    );
};
export default StudentAttendance;