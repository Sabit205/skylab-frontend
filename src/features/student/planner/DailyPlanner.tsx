import { useState, useEffect } from 'react';
import { Title, Paper, Grid, TextInput, Textarea, NumberInput, Group, Button, SimpleGrid, Checkbox, Rating, ActionIcon, Table, Text, Divider, Tabs, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import { IconPlus, IconTrash, IconLock } from '@tabler/icons-react';
import { getStartOfWeek } from '../../../utils/dateUtils';

const DailyPlanner = () => {
    const [date, setDate] = useState<Date | null>(new Date());
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [plannerStatus, setPlannerStatus] = useState<string | null>(null);
    const [currentPlannerId, setCurrentPlannerId] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            weather: '', todaysGoal: '', studyGoal: '', totalStudyTime: '', breakTime: '', sleepHours: '',
            readingList: [{ time: '', topic: '' }], assignmentsExams: '', evaluationScale: 0, selfReflection: '',
            focusTopic: '', priorityTasks: '', forTomorrow: '', todoList: [{ task: '', completed: false }],
            healthAndBody: '', waterIntake: 0, meals: { breakfast: false, lunch: false, dinner: false, snacks: false },
            dayOfWeek: '', lessonPlans: [], monthName: '', totalCross: '', cumulativeCross: '',
        },
    });

    const fetchPlannerData = () => {
        if (date) {
            setLoading(true);
            setIsLocked(false);
            setPlannerStatus(null);
            setCurrentPlannerId(null);

            const dateString = date.toISOString().split('T')[0];
            const startOfWeek = getStartOfWeek(date).toISOString();
            
            Promise.all([
                axiosPrivate.get(`/api/student/daily-planner?date=${dateString}`),
                axiosPrivate.get(`/api/student/my-schedule?weekStartDate=${startOfWeek}`)
            ]).then(([plannerRes, scheduleRes]) => {
                if (plannerRes.data) {
                    const { status, _id } = plannerRes.data;
                    setPlannerStatus(status);
                    setCurrentPlannerId(_id);
                    if (!['Pending', 'RecalledByStudent', 'TeacherDeclined'].includes(status)) {
                        setIsLocked(true);
                    }
                    form.setValues({
                        ...plannerRes.data,
                        readingList: plannerRes.data.readingList?.length > 0 ? plannerRes.data.readingList : [{ time: '', topic: '' }],
                        todoList: plannerRes.data.todoList?.length > 0 ? plannerRes.data.todoList : [{ task: '', completed: false }],
                        lessonPlans: plannerRes.data.lessonPlans?.length > 0 ? plannerRes.data.lessonPlans : [],
                    });
                } else {
                    form.reset();
                    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date).toLowerCase();
                    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
                    const scheduleForDay = scheduleRes.data?.schedule?.[dayName] || [];
                    const newLessonPlans = scheduleForDay.map((period: any) => ({
                        subjectName: period.subject?.name || 'N/A',
                        isCustom: false, // Mark schedule-based rows
                        notStudied: false,
                        homework: '',
                        todaysLesson: '',
                    }));
                    form.setFieldValue('dayOfWeek', dayName);
                    form.setFieldValue('monthName', monthName);
                    form.setFieldValue('lessonPlans', newLessonPlans);
                }
            }).catch(err => {
                notifications.show({ color: 'red', title: 'Error', message: 'Could not load data for this date.' });
            }).finally(() => {
                setLoading(false);
            });
        }
    };

    useEffect(() => {
        fetchPlannerData();
    }, [date, axiosPrivate]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            const res = await axiosPrivate.post('/api/student/daily-planner', { date, ...values });
            setPlannerStatus(res.data.status);
            setCurrentPlannerId(res.data._id);
            setIsLocked(true);
            notifications.show({ color: 'green', title: 'Success', message: 'Planner submitted for guardian approval!' });
        } catch (error: any) {
            notifications.show({ color: 'red', title: 'Error', message: error.response?.data?.message || 'Failed to submit planner.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRecall = async () => {
        if (!currentPlannerId) return;
        modals.openConfirmModal({
            title: 'Recall Planner for Editing',
            children: <Text size="sm">Are you sure? This will allow you to edit this planner again. This can only be done before a guardian has approved it.</Text>,
            labels: { confirm: 'Yes, Recall', cancel: 'Cancel' },
            confirmProps: {color: 'orange'},
            onConfirm: async () => {
                try {
                    await axiosPrivate.patch(`/api/student/daily-planner/${currentPlannerId}/recall`);
                    notifications.show({ color: 'teal', message: 'Planner recalled successfully. You can now edit it.' });
                    // Refetch data to unlock the form
                    fetchPlannerData();
                } catch(error: any) {
                    notifications.show({ color: 'red', title: 'Error', message: error.response?.data?.message || 'Could not recall planner.' });
                }
            },
        });
    };
    
    const readingListFields = form.values.readingList.map((item, index) => (
        <Group key={index} mt="xs" grow>
            <TextInput placeholder="সময়" disabled={isLocked} {...form.getInputProps(`readingList.${index}.time`)} />
            <TextInput placeholder="আজকের পড়ার তালিকা" disabled={isLocked} {...form.getInputProps(`readingList.${index}.topic`)} />
            <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('readingList', index)} disabled={isLocked}><IconTrash size={16} /></ActionIcon>
        </Group>
    ));

    const todoListFields = form.values.todoList.map((item, index) => (
        <Group key={index} mt="xs">
            <Checkbox disabled={isLocked} {...form.getInputProps(`todoList.${index}.completed`, { type: 'checkbox' })} />
            <TextInput placeholder="Task" style={{ flex: 1 }} disabled={isLocked} {...form.getInputProps(`todoList.${index}.task`)} />
            <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('todoList', index)} disabled={isLocked}><IconTrash size={16} /></ActionIcon>
        </Group>
    ));

    const lessonPlanFields = form.values.lessonPlans.map((item: any, index: number) => (
        <Table.Tr key={index}>
            <Table.Td>
                {/* --- THE DEFINITIVE FIX --- */}
                <TextInput
                    variant={item.isCustom ? 'default' : 'unstyled'}
                    readOnly={!item.isCustom}
                    placeholder="Custom Subject"
                    {...form.getInputProps(`lessonPlans.${index}.subjectName`)} 
                    disabled={isLocked}
                />
            </Table.Td>
            <Table.Td align="center"><Checkbox disabled={isLocked} {...form.getInputProps(`lessonPlans.${index}.notStudied`, { type: 'checkbox' })} /></Table.Td>
            <Table.Td><Textarea minRows={1} autosize disabled={isLocked} {...form.getInputProps(`lessonPlans.${index}.homework`)} /></Table.Td>
            <Table.Td><Textarea minRows={1} autosize disabled={isLocked} {...form.getInputProps(`lessonPlans.${index}.todaysLesson`)} /></Table.Td>
            <Table.Td>
                {/* Only allow deleting custom rows */}
                {item.isCustom && (
                    <ActionIcon color="red" variant="light" onClick={() => form.removeListItem('lessonPlans', index)} disabled={isLocked}>
                        <IconTrash size={16} />
                    </ActionIcon>
                )}
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Daily Planner</Title>
                <DatePickerInput label="Select Date" value={date} onChange={setDate} style={{minWidth: 200}}/>
            </Group>
            {isLocked && (
                <Alert color="orange" icon={<IconLock />} title="Planner Locked" mb="md">
                    This planner is currently under review and cannot be edited.
                    {plannerStatus === 'Pending' && (
                        <Button variant="light" color="orange" size="xs" mt="xs" onClick={handleRecall}>
                            Recall for Editing
                        </Button>
                    )}
                </Alert>
            )}
            {plannerStatus === 'TeacherDeclined' && (
                <Alert color="red" title="Planner Declined by Teacher" mb="md">
                    Your teacher has declined this planner. Please review their comments, make changes, and resubmit.
                </Alert>
            )}
            <form onSubmit={form.onSubmit(handleSubmit)}>
            <Tabs defaultValue="part1">
                <Tabs.List grow>
                    <Tabs.Tab value="part1">দৈনিক পরিকল্পনা (Part 1)</Tabs.Tab>
                    <Tabs.Tab value="part2">হোমওয়ার্ক ও পাঠ (Part 2)</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="part1" pt="xs">
                    <Paper withBorder p="xl" radius="md">
                         {/* Part 1 JSX with disabled={isLocked} on all inputs */}
                         <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Stack>
                                    <TextInput label="আহাওয়া" disabled={isLocked} {...form.getInputProps('weather')} />
                                    <TextInput label="আজকের লক্ষ্যসমূহ" disabled={isLocked} {...form.getInputProps('todaysGoal')} />
                                    <TextInput label="পড়ালেখার লক্ষ্য" disabled={isLocked} {...form.getInputProps('studyGoal')} />
                                    <SimpleGrid cols={3}>
                                        <TextInput label="মোট পড়ার সময়" disabled={isLocked} {...form.getInputProps('totalStudyTime')} />
                                        <TextInput label="বিরতি" disabled={isLocked} {...form.getInputProps('breakTime')} />
                                        <TextInput label="ঘুম (ঘন্টা)" disabled={isLocked} {...form.getInputProps('sleepHours')} />
                                    </SimpleGrid>
                                    <Divider label="পড়ার তালিকা" labelPosition="center" my="sm" />
                                    {readingListFields}
                                    <Button fullWidth variant="light" size="xs" mt="xs" leftSection={<IconPlus size={14}/>} onClick={() => form.insertListItem('readingList', { time: '', topic: '' })} disabled={isLocked}>Add Reading Item</Button>
                                    <Textarea label="অ্যাসাইনমেন্ট ও পরীক্ষা" mt="md" disabled={isLocked} {...form.getInputProps('assignmentsExams')} />
                                    <Text size="sm" fw={500} mt="lg">মূল্যায়ন স্কেল</Text>
                                    <Rating {...form.getInputProps('evaluationScale')} readOnly={isLocked} />
                                    <Textarea label="আমি কীভাবে উন্নতি করতে পারি" mt="md" disabled={isLocked} {...form.getInputProps('selfReflection')} />
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Stack>
                                    <Textarea label="ফোকাস" disabled={isLocked} {...form.getInputProps('focusTopic')} />
                                    <Textarea label="সর্বোচ্চ অগ্রাধিকারের কাজসমূহ" disabled={isLocked} {...form.getInputProps('priorityTasks')} />
                                    <Textarea label="আগামীকালের জন্য" disabled={isLocked} {...form.getInputProps('forTomorrow')} />
                                    <Divider label="TO DO LIST" labelPosition="center" my="sm" />
                                    {todoListFields}
                                    <Button fullWidth variant="light" size="xs" mt="xs" leftSection={<IconPlus size={14}/>} onClick={() => form.insertListItem('todoList', { task: '', completed: false })} disabled={isLocked}>Add Task</Button>
                                    <Textarea label="স্বাস্থ্য ও শরীরচর্চা" mt="md" disabled={isLocked} {...form.getInputProps('healthAndBody')} />
                                    <NumberInput label="পানি পান (গ্লাস)" min={0} disabled={isLocked} {...form.getInputProps('waterIntake')} />
                                    <Text size="sm" fw={500} mt="lg">খাবার</Text>
                                    <Group>
                                        <Checkbox label="সকালের নাস্তা" disabled={isLocked} {...form.getInputProps('meals.breakfast', { type: 'checkbox' })}/>
                                        <Checkbox label="দুপুরের খাবার" disabled={isLocked} {...form.getInputProps('meals.lunch', { type: 'checkbox' })}/>
                                        <Checkbox label="রাতের খাবার" disabled={isLocked} {...form.getInputProps('meals.dinner', { type: 'checkbox' })}/>
                                        <Checkbox label="জলখাবার" disabled={isLocked} {...form.getInputProps('meals.snacks', { type: 'checkbox' })}/>
                                    </Group>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Paper>
                </Tabs.Panel>
                <Tabs.Panel value="part2" pt="xs">
                    <Paper withBorder p="xl" radius="md">
                        <Group justify="space-between"><TextInput label="তারিখ" value={date?.toLocaleDateString() || ''} readOnly/><TextInput label="বার" {...form.getInputProps('dayOfWeek')} tt="capitalize" readOnly/></Group>
                        <Table withTableBorder withColumnBorders mt="md">
                            <Table.Thead><Table.Tr><Table.Th>বিষয়ের নাম</Table.Th><Table.Th ta="center">শিখে নাই</Table.Th><Table.Th>হোমওয়ার্ক</Table.Th><Table.Th>আজকের পাঠ</Table.Th><Table.Th>Action</Table.Th></Table.Tr></Table.Thead>
                            <Table.Tbody>{lessonPlanFields}</Table.Tbody>
                        </Table>
                         <Button fullWidth variant="light" size="xs" mt="xs" leftSection={<IconPlus size={14}/>} onClick={() => form.insertListItem('lessonPlans', { subjectName: '', isCustom: true, notStudied: false, homework: '', todaysLesson: '' })} disabled={isLocked}>Add Custom Subject</Button>
                        <Grid mt="md">
                            <Grid.Col span={6}><TextInput label="মাসের নাম" disabled={isLocked} {...form.getInputProps('monthName')} /></Grid.Col>
                            <Grid.Col span={3}><TextInput label="মোট ক্রস" disabled={isLocked} {...form.getInputProps('totalCross')} /></Grid.Col>
                            <Grid.Col span={3}><TextInput label="ক্রমযোজিত ক্রস" disabled={isLocked} {...form.getInputProps('cumulativeCross')} /></Grid.Col>
                        </Grid>
                    </Paper>
                </Tabs.Panel>
            </Tabs>
            <Button type="submit" mt="xl" fullWidth loading={loading} disabled={isLocked}>
                {plannerStatus === 'RecalledByStudent' || plannerStatus === 'TeacherDeclined' ? 'Resubmit Planner' : 'Submit Planner for Approval'}
            </Button>
            </form>
        </>
    );
};
export default DailyPlanner;