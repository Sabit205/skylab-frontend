import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text, Center, Loader } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';

// UPDATED: The `days` array is changed here as well for the UI
const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const periods = Array(8).fill(0).map((_, i) => i + 1);

const TeacherSchedule = () => {
    const [scheduleData, setScheduleData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchAndFormatSchedule = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get('/api/teacher/my-schedule');
                const flatSchedule = response.data;

                const formattedSchedule: any = {};
                for (const item of flatSchedule) {
                    if (!formattedSchedule[item.day]) {
                        formattedSchedule[item.day] = {};
                    }
                    formattedSchedule[item.day][item.period] = {
                        subject: item.subject,
                        className: item.className
                    };
                }
                setScheduleData(formattedSchedule);
            } catch (error) {
                notifications.show({ color: 'red', title: 'Error', message: 'Failed to load schedule.' });
            } finally {
                setLoading(false);
            }
        };
        fetchAndFormatSchedule();
    }, [axiosPrivate]);

    if (loading) {
        return <Center p="xl"><Loader /></Center>;
    }

    return (
        <>
            <Title order={2} mb="lg">My Weekly Schedule</Title>
            <Paper withBorder p="md" radius="md" style={{ overflow: 'auto' }}>
                 <Table withTableBorder withColumnBorders miw={1000} highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Day / Period</Table.Th>
                            {periods.map(p => <Table.Th key={p} ta="center">Period {p}</Table.Th>)}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {/* The table rows are generated from the new `days` array */}
                        {days.map(day => (
                            <Table.Tr key={day}>
                                <Table.Td tt="capitalize" fw={500}>{day}</Table.Td>
                                {periods.map(p => {
                                    const periodData = scheduleData[day]?.[p];
                                    return (
                                        <Table.Td key={`${day}-${p}`} ta="center">
                                            {periodData ? (
                                                <>
                                                    <Text fw={500}>{periodData.subject || 'N/A'}</Text>
                                                    <Text size="xs" c="dimmed">{periodData.className}</Text>
                                                </>
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

export default TeacherSchedule;