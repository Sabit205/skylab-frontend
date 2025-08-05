import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const periods = Array(8).fill(0).map((_, i) => i + 1);

const StudentSchedule = () => {
    const [schedule, setSchedule] = useState<any>(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        axiosPrivate.get('/api/student/my-schedule').then(res => setSchedule(res.data?.schedule));
    }, [axiosPrivate]);

    return (
        <>
            <Title order={2} mb="lg">My Weekly Schedule</Title>
            <Paper withBorder p="md" radius="md" style={{ overflow: 'auto' }}>
                 <Table withTableBorder withColumnBorders miw={1000}>
                    <Table.Thead>
                        <Table.Tr><Table.Th>Day / Period</Table.Th>{periods.map(p => <Table.Th key={p} ta="center">Period {p}</Table.Th>)}</Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {days.map(day => (
                            <Table.Tr key={day}>
                                <Table.Td tt="capitalize" fw={500}>{day}</Table.Td>
                                {periods.map(p => {
                                    const periodData = schedule?.[day]?.find((pd: any) => pd.period === p);
                                    return (
                                        <Table.Td key={`${day}-${p}`} ta="center">
                                            {periodData?.subject ? (
                                                <><Text fw={500}>{periodData.subject}</Text><Text size="xs" c="dimmed">{periodData.teacher?.fullName || 'N/A'}</Text></>
                                            ) : '-'}
                                        </Table.Td>
                                    )
                                })}
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </>
    );
};
export default StudentSchedule;