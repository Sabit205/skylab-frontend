import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title, Paper, Grid, TextInput, Textarea, NumberInput, Group, SimpleGrid, Checkbox, Rating, ActionIcon, Table, Text, Divider, Tabs, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { DatePickerInput } from '@mantine/dates';

const GuardianPlannerView = () => {
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
        axiosPrivate.get(`/api/guardian/planner-details/${plannerId}`)
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
            <TextInput readOnly variant="filled" placeholder="সময়" value={item.time} />
            <TextInput readOnly variant="filled" placeholder="আজকের পড়ার তালিকা" value={item.topic} />
        </Group>
    ));

    const todoListFields = form.values.todoList.map((item: any, index: number) => (
        <Group key={index} mt="xs">
            <Checkbox checked={item.completed} readOnly labelPosition="left" />
            <TextInput readOnly variant="filled" placeholder="Task" style={{ flex: 1 }} value={item.task} />
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
            <Title order={2} mb="lg">Viewing Planner for {form.values.student.fullName}</Title>
            <Tabs defaultValue="part1">
                <Tabs.List grow>
                    <Tabs.Tab value="part1">দৈনিক পরিকল্পনা (Part 1)</Tabs.Tab>
                    <Tabs.Tab value="part2">হোমওয়ার্ক ও পাঠ (Part 2)</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="part1" pt="xs">
                    <Paper withBorder p="xl" radius="md">
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Stack>
                                    <TextInput label="আহাওয়া" readOnly variant="filled" {...form.getInputProps('weather')} />
                                    <TextInput label="আজকের লক্ষ্যসমূহ" readOnly variant="filled" {...form.getInputProps('todaysGoal')} />
                                    <TextInput label="পড়ালেখার লক্ষ্য" readOnly variant="filled" {...form.getInputProps('studyGoal')} />
                                    <SimpleGrid cols={3}>
                                        <TextInput label="মোট পড়ার সময়" readOnly variant="filled" {...form.getInputProps('totalStudyTime')} />
                                        <TextInput label="বিরতি" readOnly variant="filled" {...form.getInputProps('breakTime')} />
                                        <TextInput label="ঘুম (ঘন্টা)" readOnly variant="filled" {...form.getInputProps('sleepHours')} />
                                    </SimpleGrid>
                                    <Divider label="পড়ার তালিকা" labelPosition="center" my="sm" />
                                    {readingListFields}
                                    <Textarea label="অ্যাসাইনমেন্ট ও পরীক্ষা" readOnly variant="filled" {...form.getInputProps('assignmentsExams')} />
                                    <Text size="sm" fw={500} mt="lg">মূল্যায়ন স্কেল</Text>
                                    <Rating readOnly value={form.values.evaluationScale} />
                                    <Textarea label="আমি কীভাবে উন্নতি করতে পারি" readOnly variant="filled" {...form.getInputProps('selfReflection')} />
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Stack>
                                    <Textarea label="ফোকাস" readOnly variant="filled" {...form.getInputProps('focusTopic')} />
                                    <Textarea label="সর্বোচ্চ অগ্রাধিকারের কাজসমূহ" readOnly variant="filled" {...form.getInputProps('priorityTasks')} />
                                    <Textarea label="আগামীকালের জন্য" readOnly variant="filled" {...form.getInputProps('forTomorrow')} />
                                    <Divider label="TO DO LIST" labelPosition="center" my="sm" />
                                    {todoListFields}
                                    <Textarea label="স্বাস্থ্য ও শরীরচর্চা" readOnly variant="filled" {...form.getInputProps('healthAndBody')} />
                                    <NumberInput label="পানি পান (গ্লাস)" readOnly variant="filled" {...form.getInputProps('waterIntake')} />
                                    <Text size="sm" fw={500} mt="lg">খাবার</Text>
                                    <Group>
                                        <Checkbox label="সকালের নাস্তা" readOnly {...form.getInputProps('meals.breakfast', { type: 'checkbox' })}/>
                                        <Checkbox label="দুপুরের খাবার" readOnly {...form.getInputProps('meals.lunch', { type: 'checkbox' })}/>
                                        <Checkbox label="রাতের খাবার" readOnly {...form.getInputProps('meals.dinner', { type: 'checkbox' })}/>
                                        <Checkbox label="জলখাবার" readOnly {...form.getInputProps('meals.snacks', { type: 'checkbox' })}/>
                                    </Group>
                                </Stack>
                            </Grid.Col>
                        </Grid>
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
export default GuardianPlannerView;