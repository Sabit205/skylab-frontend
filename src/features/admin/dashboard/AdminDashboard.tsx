import { useEffect, useState } from 'react';
import { Grid, Paper, Text, Group, ThemeIcon, Table, Avatar, Badge, Title } from '@mantine/core';
import { IconUsers, IconReportMoney, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

interface StatData {
    students: number;
    teachers: number;
    revenue: number;
    expenses: number;
    profit: number;
    recentUsers: any[];
    monthlyBreakdown: any[];
}
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AdminDashboard = () => {
    const axiosPrivate = useAxiosPrivate();
    const [stats, setStats] = useState<StatData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosPrivate.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [axiosPrivate]);

    const chartData = stats?.monthlyBreakdown.map(item => ({
        name: monthNames[item._id.month - 1],
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.revenue - item.expenses,
    })) || [];

    const recentUserRows = stats?.recentUsers.map((user) => (
        <Table.Tr key={user._id}>
            <Table.Td><Group><Avatar size="sm" radius="xl" /><Text fz="sm" fw={500}>{user.fullName}</Text></Group></Table.Td>
            <Table.Td><Badge color={user.role === 'Student' ? 'blue' : 'teal'} variant="light">{user.role}</Badge></Table.Td>
        </Table.Tr>
    ));

    const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string; }) => (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
                <ThemeIcon color={color} variant="light" radius="md" size={36}>{icon}</ThemeIcon>
            </Group>
            <Text fz={32} fw={700}>{value}</Text>
        </Paper>
    );

    return (
        <>
            <Title order={2} mb="xl">Admin Dashboard</Title>
            <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}><StatCard title="Total Students" value={loading ? '...' : (stats?.students ?? 0)} icon={<IconUsers size="1.4rem" />} color="blue" /></Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}><StatCard title="Total Revenue" value={loading ? '...' : `৳${stats?.revenue.toLocaleString() ?? 0}`} icon={<IconReportMoney size="1.4rem" />} color="green" /></Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}><StatCard title="Total Expenses" value={loading ? '...' : `৳${stats?.expenses.toLocaleString() ?? 0}`} icon={<IconArrowDownRight size="1.4rem" />} color="orange" /></Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}><StatCard title="Total Profit" value={loading ? '...' : `৳${stats?.profit.toLocaleString() ?? 0}`} icon={<IconArrowUpRight size="1.4rem" />} color={stats?.profit ?? 0 >= 0 ? 'teal' : 'red'} /></Grid.Col>
            </Grid>
            <Grid mt="xl">
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Paper withBorder p="xl" radius="md">
                        <Title order={4} mb="md">Monthly Financial Overview</Title>
                        <ResponsiveContainer width="100%" height={350}>
                            <ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value: number) => `৳${value.toLocaleString()}`} /><Legend /><Bar dataKey="revenue" fill="#40C057" name="Revenue" /><Bar dataKey="expenses" fill="#FA5252" name="Expenses" /><Line type="monotone" dataKey="profit" stroke="#15aabf" strokeWidth={2} name="Profit" /></ComposedChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Paper withBorder p="md" radius="md" style={{height: '100%'}}>
                        <Title order={4} mb="md">Recent Registrations</Title>
                        <Table verticalSpacing="sm"><Table.Tbody>{recentUserRows}</Table.Tbody></Table>
                    </Paper>
                </Grid.Col>
            </Grid>
        </>
    );
};
export default AdminDashboard;