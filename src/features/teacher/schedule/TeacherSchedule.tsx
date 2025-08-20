import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text, Center, Loader, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { getWeekDates, getStartOfWeek } from '../../../utils/dateUtils';
import { formatTime } from '../../../utils/timeUtils';

const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const periods = Array(8).fill(0).map((_, i) => i + 1);

const TeacherSchedule = () => {
    const [scheduleData, setScheduleData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [week, setWeek] = useState<Date>(getStartOfWeek(new Date()));
    const axiosPrivate = useAxiosPrivate();

    const weekDates = getWeekDates(week);

    useEffect(() => {
        setLoading(true);
        const fetchAndFormatSchedule = async () => {
            try {
                const response = await axiosPrivate.get('/api/teacher/my-schedule', {
                    params: { weekStartDate: week.toISOString() }
                });
                
                const scheduleObject = response.data.schedule || {};
                const formattedSchedule: any = {};
                
                days.forEach(day => {
                    formattedSchedule[day] = {};
                    if(scheduleObject[day]) {
                        scheduleObject[day].forEach((period: any) => {
                            formattedSchedule[day][period.period] = period;
                        });
                    }
                });

                setScheduleData(formattedSchedule);
            } catch (error) {
                notifications.show({ color: 'red', title: 'Error', message: 'Failed to load schedule for the selected week.' });
                setScheduleData({});
            } finally {
                setLoading(false);
            }
        };
        fetchAndFormatSchedule();
    }, [axiosPrivate, week]);

    if (loading) {
        return <Center p="xl"><Loader /></Center>;
    }

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>My Weekly Schedule</Title>
                <DatePickerInput
                    label="Select Week"
                    placeholder="Pick a date"
                    value={week}
                    onChange={(date) => date && setWeek(getStartOfWeek(date))}
                    valueFormat="MMM D, YYYY"
                    style={{ minWidth: 200 }}
                />
            </Group>
            <Paper withBorder p="md" radius="md" style={{ overflow: 'auto' }}>
                 <Table withTableBorder withColumnBorders miw={1000} highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Day / Period</Table.Th>
                            {periods.map(p => <Table.Th key={p} ta="center">Period {p}</Table.Th>)}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {days.map(day => (
                            <Table.Tr key={day}>
                                <Table.Td>
                                    <Text tt="capitalize" fw={500}>{day}</Text>
                                    <Text size="xs" c="dimmed">{weekDates[day]}</Text>
                                </Table.Td>
                                {periods.map(p => {
                                    const periodData = scheduleData[day]?.[p];
                                    return (
                                        <Table.Td key={`${day}-${p}`} ta="center">
                                            {periodData ? (
                                                <>
                                                    <Text fw={500}>{periodData.subject?.name || 'N/A'}</Text>
                                                    <Text size="xs" c="dimmed">{periodData.className}</Text>
                                                    <Text size="xs" c="dimmed">{formatTime(periodData.startTime)} - {formatTime(periodData.endTime)}</Text>
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