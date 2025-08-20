import { useState, useEffect } from 'react';
import { Table, Select, Button, Group, Title, Paper, Loader, Center, Text, Stack } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { getWeekDates, getStartOfWeek } from '../../../utils/dateUtils';

const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const periods = Array(8).fill(0).map((_, i) => i + 1);

const createDefaultPeriods = () => Array(8).fill(null).map((_, i) => ({ 
    period: i + 1, 
    startTime: '', 
    endTime: '', 
    subject: null, 
    teacher: null 
}));

const ScheduleManagement = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [week, setWeek] = useState<Date>(getStartOfWeek(new Date()));
    const [schedule, setSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const weekDates = getWeekDates(week);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, teacherRes, subjectRes] = await Promise.all([
                    axiosPrivate.get('/classes'),
                    axiosPrivate.get('/users?role=Teacher&limit=200'),
                    axiosPrivate.get('/subjects')
                ]);
                setClasses(classRes.data.map((c: any) => ({ value: c._id, label: c.name })));
                setTeachers(teacherRes.data.users.map((t: any) => ({ value: t._id, label: t.fullName })));
                setSubjects(subjectRes.data.map((s: any) => ({ value: s._id, label: s.name })));
            } catch (error) {
                notifications.show({ color: 'red', title: 'Error', message: 'Failed to load initial data' });
            }
        };
        fetchData();
    }, [axiosPrivate]);

    useEffect(() => {
        if (selectedClass && week) {
            setLoading(true);
            const fetchSchedule = async () => {
                try {
                    const response = await axiosPrivate.get(`/schedules`, {
                        params: { classId: selectedClass, weekStartDate: week.toISOString() }
                    });

                    const fetchedSchedule = response.data.schedule || {};
                    const completeSchedule: { [key: string]: any[] } = {};
                    days.forEach(day => {
                        completeSchedule[day] = fetchedSchedule[day] && fetchedSchedule[day].length ? fetchedSchedule[day] : createDefaultPeriods();
                    });
                    setSchedule(completeSchedule);
                } catch (error) {
                    notifications.show({ color: 'red', title: 'Error', message: 'Could not fetch schedule' });
                } finally {
                    setLoading(false);
                }
            };
            fetchSchedule();
        } else {
            setSchedule(null);
        }
    }, [selectedClass, week, axiosPrivate]);

    const handleScheduleChange = (day: string, periodToUpdate: number, field: string, value: string | null) => {
        setSchedule((currentSchedule: any) => {
            const newDaySchedule = currentSchedule[day].map((period: any) => {
                if (period.period === periodToUpdate) {
                    return { ...period, [field]: value };
                }
                return period;
            });
            return { ...currentSchedule, [day]: newDaySchedule };
        });
    };

    const handleSaveSchedule = async () => {
        setLoading(true);
        try {
            await axiosPrivate.put(`/schedules`, { 
                classId: selectedClass,
                weekStartDate: week.toISOString(),
                schedule 
            });
            notifications.show({ color: 'green', title: 'Success', message: 'Schedule saved successfully!' });
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to save schedule' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Class Schedule Management</Title>
                <Group>
                    <DatePickerInput
                        label="Select Week"
                        placeholder="Pick a date in the week"
                        value={week}
                        onChange={(date) => date && setWeek(getStartOfWeek(date))}
                        valueFormat="MMM D, YYYY"
                    />
                    <Select label="Select a Class" placeholder="Pick one" data={classes} value={selectedClass} onChange={setSelectedClass} searchable clearable />
                </Group>
            </Group>
            <Paper withBorder p="md" radius="md" style={{ overflow: 'auto' }}>
                {loading && <Center><Loader /></Center>}
                {!selectedClass && !loading && <Text c="dimmed" ta="center" p="xl">Please select a class and week to begin.</Text>}
                {schedule && !loading && (
                    <>
                        <Table withTableBorder withColumnBorders miw={1600}>
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
                                            const currentPeriod = schedule[day]?.find((s: any) => s.period === p) || {};
                                            return (
                                                <Table.Td key={`${day}-${p}`}>
                                                    <Stack>
                                                        <Group grow>
                                                            <TimeInput size="xs" value={currentPeriod.startTime || ''} onChange={(e) => handleScheduleChange(day, p, 'startTime', e.currentTarget.value)} placeholder="Start" />
                                                            <TimeInput size="xs" value={currentPeriod.endTime || ''} onChange={(e) => handleScheduleChange(day, p, 'endTime', e.currentTarget.value)} placeholder="End" />
                                                        </Group>
                                                        <Select size="xs" placeholder="Subject" data={subjects} value={currentPeriod.subject?._id || currentPeriod.subject} onChange={(value) => handleScheduleChange(day, p, 'subject', value)} searchable clearable />
                                                        <Select size="xs" placeholder="Teacher" data={teachers} value={currentPeriod.teacher?._id || currentPeriod.teacher} onChange={(value) => handleScheduleChange(day, p, 'teacher', value)} searchable clearable />
                                                    </Stack>
                                                </Table.Td>
                                            )
                                        })}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                        <Group justify="flex-end" mt="md"><Button onClick={handleSaveSchedule} loading={loading}>Save Schedule</Button></Group>
                    </>
                )}
            </Paper>
        </>
    );
};
export default ScheduleManagement;