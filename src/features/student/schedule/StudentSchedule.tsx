import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text, Center, Loader, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { getWeekDates, getStartOfWeek } from '../../../utils/dateUtils';
import { notifications } from '@mantine/notifications';
import { formatTime } from '../../../utils/timeUtils';

const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const periods = Array(8).fill(0).map((_, i) => i + 1);

interface StudentScheduleProps {
    isGuardian?: boolean;
}

const StudentSchedule = ({ isGuardian = false }: StudentScheduleProps) => {
    const [schedule, setSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [week, setWeek] = useState<Date>(getStartOfWeek(new Date()));
    const axiosPrivate = useAxiosPrivate();
    
    const weekDates = getWeekDates(week);

    useEffect(() => {
        setLoading(true);
        const endpoint = isGuardian ? '/api/guardian/my-schedule' : '/api/student/my-schedule';
        axiosPrivate.get(endpoint, { params: { weekStartDate: week.toISOString() }})
            .then(res => setSchedule(res.data?.schedule))
            .catch(() => notifications.show({color: 'red', title: 'Error', message: 'Could not load the schedule for this week.'}))
            .finally(() => setLoading(false));
    }, [axiosPrivate, week, isGuardian]);

    if(loading) return <Center><Loader/></Center>;

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Weekly Schedule</Title>
                <DatePickerInput
                    label="Select Week"
                    placeholder="Pick a date"
                    value={week}
                    onChange={(date) => date && setWeek(getStartOfWeek(date))}
                    valueFormat="MMM D, YYYY"
                />
            </Group>
            <Paper withBorder p="md" radius="md" style={{ overflow: 'auto' }}>
                 {!schedule ? (<Text c="dimmed" ta="center" p="xl">No schedule has been set for this week.</Text>) : (
                <Table withTableBorder withColumnBorders miw={1000}>
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
                                    const periodData = schedule?.[day]?.find((pd: any) => pd.period === p);
                                    return (
                                        <Table.Td key={`${day}-${p}`} ta="center">
                                            {periodData?.subject ? (
                                                <>
                                                    <Text fw={500}>{periodData.subject?.name || 'N/A'}</Text>
                                                    <Text size="xs" c="dimmed">{periodData.teacher?.fullName || 'N/A'}</Text>
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
                )}
            </Paper>
        </>
    );
};
export default StudentSchedule;