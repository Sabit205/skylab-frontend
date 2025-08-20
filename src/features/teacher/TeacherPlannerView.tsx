import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title, Paper, Grid, TextInput, Textarea, NumberInput, Group, SimpleGrid, Checkbox, Rating, Table, Text, Divider, Tabs, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { DatePickerInput } from '@mantine/dates';

const TeacherPlannerView = () => {
    const { plannerId } = useParams();
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    const form = useForm({
        initialValues: {
            date: new Date(), student: { fullName: '' },
            weather: '', todaysGoal: '', studyGoal: '', totalStudyTime: '', breakTime: '', sleepHours: '',
            readingList: [], assignmentsExams: '', evaluationScale: 0, selfReflection: '',
            focusTopic: '', priorityTasks: '', forTomorrow: '', todoList: [],
            healthAndBody: '', waterIntake: 0, meals: { breakfast: false, lunch: false, dinner: false, snacks: false },
            dayOfWeek: '', lessonPlans: [], monthName: '', totalCross: '', cumulativeCross: '',
        },
    });

    useEffect(() => {
        setLoading(true);
        axiosPrivate.get(`/api/teacher/planner-details/${plannerId}`)
            .then(res => {
                const plannerData = res.data;
                form.setValues({
                    ...plannerData,
                    date: new Date(plannerData.date),
                    readingList: plannerData.readingList?.length > 0 ? plannerData.readingList : [],
                    todoList: plannerData.todoList?.length > 0 ? plannerData.todoList : [],
                    lessonPlans: plannerData.lessonPlans?.length > 0 ? plannerData.lessonPlans : [],
                });
            })
            .finally(() => setLoading(false));
    }, [plannerId, axiosPrivate]);
    
    const readingListFields = form.values.readingList.map((item: any, index: number) => (
        <Group key={index} mt="xs" grow>
            <TextInput readOnly variant="filled" label="সময়" value={item.time} />
            <TextInput readOnly variant="filled" label="পড়ার বিষয়" value={item.topic} />
        </Group>
    ));

    const todoListFields = form.values.todoList.map((item: any, index: number) => (
        <Group key={index} mt="xs">
            <TextInput readOnly variant="filled" style={{ flex: 1 }} value={item.task} />
            <Checkbox checked={item.completed} readOnly label="Completed" />
        </Group>
    ));

    const lessonPlanFields = form.values.lessonPlans.map((item: any, index: number) => (
        <Table.Tr key={index}>
            <Table.Td>{item.subjectName}</Table.Td>
            <Table.Td align="center"><Checkbox checked={item.studied} readOnly /></Table.Td>
            <Table.Td align="center"><Checkbox checked={item.notStudied} readOnly /></Table.Td>
            <Table.Td><Text size="sm">{item.homework}</Text></Table.Td>
            <Table.Td><Text size="sm">{item.todaysLesson}</Text></Table.Td>
        </Table.Tr>
    ));

    if (loading) return <Text>Loading planner...</Text>;
    if (!form.values) return <Text>Planner not found.</Text>;
    
    return (
        <>
            <Title order={2}>Reviewing Planner for {form.values.student.fullName}</Title>
            <Text c="dimmed">Date: {new Date(form.values.date).toLocaleDateString()}</Text>
            <Tabs defaultValue="part1" mt="lg">
                <Tabs.List grow>
                    <Tabs.Tab value="part1">দৈনিক পরিকল্পনা (Part 1)</Tabs.Tab>
                    <Tabs.Tab value="part2">হোমওয়ার্ক ও পাঠ (Part 2)</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="part1" pt="xs">
                    <Paper withBorder p="xl" radius="md">
                        {/* Part 1 Read-only JSX here */}
                    </Paper>
                </Tabs.Panel>
                <Tabs.Panel value="part2" pt="xs">
                    <Paper withBorder p="xl" radius="md">
                         <Group justify="space-between">
                            <DatePickerInput label="তারিখ" value={form.values.date} readOnly variant="filled" />
                            <TextInput label="বার" {...form.getInputProps('dayOfWeek')} tt="capitalize" readOnly variant="filled"/>
                        </Group>
                        <Table withTableBorder withColumnBorders mt="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>বিষয়ের নাম</Table.Th>
                                    <Table.Th ta="center">পড়া</Table.Th>
                                    <Table.Th ta="center">শিখে নাই</Table.Th>
                                    <Table.Th>হোমওয়ার্ক</Table.Th>
                                    <Table.Th>আজকের পাঠ</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{lessonPlanFields}</Table.Tbody>
                        </Table>
                        <Grid mt="md">
                             <Grid.Col span={6}><TextInput label="মাসের নাম" readOnly variant="filled" {...form.getInputProps('monthName')} /></Grid.Col>
                             <Grid.Col span={3}><TextInput label="মোট ক্রস" readOnly variant="filled" {...form.getInputProps('totalCross')} /></Grid.Col>
                             <Grid.Col span={3}><TextInput label="ক্রমযোজিত ক্রস" readOnly variant="filled" {...form.getInputProps('cumulativeCross')} /></Grid.Col>
                        </Grid>
                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </>
    );
};
export default TeacherPlannerView;