import { useState, useEffect } from 'react';
import { Title, Paper, Accordion, Text, Select, Textarea, Button, Group, Loader, Center, Table } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { formatTime } from '../../../utils/timeUtils';
import { getStartOfWeek } from '../../../utils/dateUtils';

const getDayOfWeek = () => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();

const TeacherPerformance = () => {
    const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
    const [students, setStudents] = useState<any>({});
    const [performance, setPerformance] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const startOfWeek = getStartOfWeek(new Date()).toISOString();
                // Use the single, reliable /my-schedule endpoint
                const scheduleRes = await axiosPrivate.get('/api/teacher/my-schedule', { params: { weekStartDate: startOfWeek }});
                
                const day = getDayOfWeek();
                let today = [];
                // Check if the schedule for today exists and extract it
                if (scheduleRes.data?.schedule?.[day]) {
                    today = scheduleRes.data.schedule[day];
                }
                setTodaysClasses(today);

                if (today.length > 0) {
                    const uniqueClassIds = [...new Set(today.map((c: any) => c.classId))];
                    const studentPromises = uniqueClassIds.map((id: any) => axiosPrivate.get(`/api/teacher/class-students/${id}`));
                    
                    const studentResults = await Promise.all(studentPromises);
                    const studentMap: any = {};
                    uniqueClassIds.forEach((id: any, index: number) => {
                        studentMap[id] = studentResults[index].data;
                    });
                    setStudents(studentMap);
                }
            } catch (error) {
                console.error(error);
                notifications.show({ color: 'red', title: 'Error', message: 'Could not fetch today\'s schedule.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [axiosPrivate]);
    
    const handlePerformanceChange = (classId: string, studentId: string, field: 'rating' | 'comment', value: string | null) => {
        setPerformance((prev: any) => ({
            ...prev,
            [`${classId}-${studentId}`]: {
                ...prev[`${classId}-${studentId}`],
                [field]: value,
            }
        }));
    };
    
    const handleSubmit = async (classId: string, subjectId: string, studentId: string) => {
        const studentPerformance = performance[`${classId}-${studentId}`];
        if (!studentPerformance || !studentPerformance.rating) {
            notifications.show({ color: 'red', title: 'Missing Field', message: 'Please select a rating.' });
            return;
        }
        
        const payload = {
            studentId, classId, subjectId,
            rating: studentPerformance.rating,
            comment: studentPerformance.comment || '',
            date: new Date().toISOString().split('T')[0],
        };
        
        try {
            await axiosPrivate.post('/api/teacher/performance', payload);
            notifications.show({ color: 'green', title: 'Success', message: 'Performance submitted successfully!' });
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to submit performance.' });
        }
    };

    if(loading) return <Center><Loader/></Center>;

    return (
        <>
            <Title order={2} mb="lg">Submit Today's Performance</Title>
            {todaysClasses.length > 0 ? (
                <Accordion variant="separated">
                    {todaysClasses.map(item => (
                        <Accordion.Item value={`${item.className}-${item.period}`} key={`${item.className}-${item.period}`}>
                            <Accordion.Control>
                                <Group justify="space-between">
                                    <Group>
                                        <Text fw={500}>{item.className}</Text> 
                                        <Text size="sm" c="dimmed">{item.subject?.name}</Text> 
                                    </Group>
                                    <Text size="sm" c="dimmed">{formatTime(item.startTime)} - {formatTime(item.endTime)}</Text>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Table verticalSpacing="sm">
                                    <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Rating</Table.Th><Table.Th>Comment</Table.Th><Table.Th>Action</Table.Th></Table.Tr></Table.Thead>
                                    <Table.Tbody>
                                        {students[item.classId]?.map((student: any) => (
                                            <Table.Tr key={student._id}>
                                                <Table.Td>{student.fullName}</Table.Td>
                                                <Table.Td style={{minWidth: 180}}><Select placeholder="Select rating" data={['Good', 'Average', 'Needs Improvement']} onChange={(value) => handlePerformanceChange(item.classId, student._id, 'rating', value)} allowDeselect={false} /></Table.Td>
                                                <Table.Td><Textarea rows={1} placeholder="Optional comment..." onChange={(e) => handlePerformanceChange(item.classId, student._id, 'comment', e.currentTarget.value)} /></Table.Td>
                                                <Table.Td><Button size="xs" onClick={() => handleSubmit(item.classId, item.subject._id, student._id)}>Submit</Button></Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            ) : (
                <Paper withBorder p="xl" radius="md">
                    <Text ta="center" c="dimmed">You have no classes scheduled for today.</Text>
                </Paper>
            )}
        </>
    );
};
export default TeacherPerformance;