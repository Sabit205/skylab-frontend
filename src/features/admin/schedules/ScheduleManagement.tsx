import { useState, useEffect } from 'react';
import { Table, Select, TextInput, Button, Group, Title, Paper, Loader, Center, Text, Stack } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';

const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const periods = Array(8).fill(0).map((_, i) => i + 1);

// Helper to create a fresh default array of periods for a day
const createDefaultPeriods = () => Array(8).fill(null).map((_, i) => ({ period: i + 1, subject: '', teacher: null }));

// Helper to create a complete, empty schedule structure
const createDefaultSchedule = () => {
    const schedule: { [key: string]: any[] } = {};
    days.forEach(day => {
        schedule[day] = createDefaultPeriods();
    });
    return schedule;
};

const ScheduleManagement = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // Fetch initial data (classes and teachers)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, teacherRes] = await Promise.all([
                    axiosPrivate.get('/classes'),
                    axiosPrivate.get('/users?role=Teacher&limit=200')
                ]);
                setClasses(classRes.data.map((c: any) => ({ value: c._id, label: c.name })));
                setTeachers(teacherRes.data.users.map((t: any) => ({ value: t._id, label: t.fullName })));
            } catch (error) {
                notifications.show({ color: 'red', title: 'Error', message: 'Failed to load initial data' });
            }
        };
        fetchData();
    }, [axiosPrivate]);

    // Fetch schedule when a class is selected
    useEffect(() => {
        if (selectedClass) {
            setLoading(true);
            const fetchSchedule = async () => {
                try {
                    const response = await axiosPrivate.get(`/schedules/${selectedClass}`);
                    const fetchedSchedule = response.data.schedule;
                    
                    // --- THE DEFINITIVE STATE HYDRATION FIX ---
                    // 1. Start with a complete, default schedule structure.
                    const completeSchedule = createDefaultSchedule();

                    // 2. Merge the data from the database on top of the default structure.
                    //    This guarantees that `saturday` and `sunday` will always exist,
                    //    and any existing data from other days will be preserved.
                    for (const day in fetchedSchedule) {
                        if (completeSchedule[day]) {
                            // We need to merge period by period to ensure we don't lose any default periods
                            const dayPeriods = [...completeSchedule[day]];
                            fetchedSchedule[day].forEach((dbPeriod: any) => {
                                const index = dayPeriods.findIndex(p => p.period === dbPeriod.period);
                                if (index !== -1) {
                                    dayPeriods[index] = dbPeriod;
                                }
                            });
                            completeSchedule[day] = dayPeriods;
                        }
                    }
                    
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
    }, [selectedClass, axiosPrivate]);

    // This is the correct, immutable state update function
    const handleScheduleChange = (day: string, periodToUpdate: number, field: 'subject' | 'teacher', value: string | null) => {
        setSchedule((currentSchedule: any) => {
            const periodIndex = currentSchedule[day].findIndex((p: any) => p.period === periodToUpdate);
            if (periodIndex === -1) return currentSchedule;

            const updatedPeriod = {
                ...currentSchedule[day][periodIndex],
                [field]: value,
            };

            const newDaySchedule = [
                ...currentSchedule[day].slice(0, periodIndex),
                updatedPeriod,
                ...currentSchedule[day].slice(periodIndex + 1),
            ];

            return {
                ...currentSchedule,
                [day]: newDaySchedule,
            };
        });
    };

    const handleSaveSchedule = async () => {
        setLoading(true);
        try {
            await axiosPrivate.put(`/schedules/${selectedClass}`, { schedule });
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
                <Select
                    label="Select a Class to Edit"
                    placeholder="Pick one"
                    data={classes}
                    value={selectedClass}
                    onChange={setSelectedClass}
                    style={{ minWidth: 250 }}
                    searchable
                    clearable
                />
            </Group>

            <Paper withBorder p="md" radius="md" style={{ overflow: 'auto' }}>
                {loading && <Center><Loader /></Center>}
                {!selectedClass && !loading && <Text c="dimmed" ta="center" p="xl">Please select a class to view or edit its schedule.</Text>}
                
                {schedule && !loading && (
                    <>
                        <Table withTableBorder withColumnBorders miw={1200}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Day / Period</Table.Th>
                                    {periods.map(p => <Table.Th key={p} ta="center">Period {p}</Table.Th>)}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {days.map(day => (
                                    <Table.Tr key={day}>
                                        <Table.Td tt="capitalize" fw={500}>{day}</Table.Td>
                                        {periods.map(p => {
                                            // This is now 100% safe because the state hydration guarantees
                                            // that `schedule[day]` and the period within it will always exist.
                                            const currentPeriod = schedule[day].find((s: any) => s.period === p);

                                            return (
                                                <Table.Td key={`${day}-${p}`}>
                                                    <Stack>
                                                        <TextInput
                                                            placeholder="Subject"
                                                            value={currentPeriod.subject || ''}
                                                            onChange={(e) => handleScheduleChange(day, p, 'subject', e.currentTarget.value)}
                                                        />
                                                        <Select
                                                            placeholder="Select Teacher"
                                                            data={teachers}
                                                            value={currentPeriod.teacher?._id || currentPeriod.teacher || null}
                                                            onChange={(value) => handleScheduleChange(day, p, 'teacher', value)}
                                                            searchable
                                                            clearable
                                                        />
                                                    </Stack>
                                                </Table.Td>
                                            )
                                        })}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                        <Group justify="flex-end" mt="md">
                            <Button onClick={handleSaveSchedule} loading={loading}>Save Schedule</Button>
                        </Group>
                    </>
                )}
            </Paper>
        </>
    );
};

export default ScheduleManagement;