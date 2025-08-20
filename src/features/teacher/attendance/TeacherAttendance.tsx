import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text, Button, Group, Alert, Radio, Loader, Center, Select } from '@mantine/core';
import { IconAlertCircle, IconChecklist } from '@tabler/icons-react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import { getStartOfWeek } from '../../../utils/dateUtils';

// This is a sub-component to handle the actual attendance form for a selected class
const AttendanceForm = ({ classInfo, onComplete }: { classInfo: any, onComplete: () => void }) => {
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any>({});
    const [attendanceStatus, setAttendanceStatus] = useState({ isTaken: false, data: null });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const checkAttendanceAndFetchStudents = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const statusRes = await axiosPrivate.get(`/api/teacher/attendance-status/${classInfo.classId}/${today}`);
                setAttendanceStatus({ isTaken: statusRes.data.taken, data: statusRes.data.data });

                if (!statusRes.data.taken) {
                    const studentRes = await axiosPrivate.get(`/api/teacher/class-students/${classInfo.classId}`);
                    setStudents(studentRes.data);
                    const initialAttendance = studentRes.data.reduce((acc: any, student: any) => {
                        acc[student._id] = 'Present';
                        return acc;
                    }, {});
                    setAttendance(initialAttendance);
                }
            } catch (error) {
                notifications.show({ color: 'red', title: 'Error', message: 'Failed to load class data.' });
            } finally {
                setLoading(false);
            }
        };
        checkAttendanceAndFetchStudents();
    }, [classInfo, axiosPrivate]);

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const records = Object.keys(attendance).map(studentId => ({ studentId, status: attendance[studentId] }));
        try {
            await axiosPrivate.post('/api/teacher/attendance', {
                classId: classInfo.classId,
                date: new Date().toISOString().split('T')[0],
                records,
            });
            notifications.show({ color: 'green', title: 'Success', message: 'Attendance submitted!' });
            onComplete(); // Notify parent to refresh the main state
        } catch (error: any) {
            notifications.show({ color: 'red', title: 'Error', message: error.response?.data?.message || 'Failed to submit.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Center p="xl"><Loader /></Center>;

    if (attendanceStatus.isTaken) {
        return (
            <>
                <Alert color="green" title="Attendance Submitted" mt="md" icon={<IconChecklist />}>
                    Attendance for this class has already been taken today.
                </Alert>
                <Table mt="md" highlightOnHover>
                    <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>{(attendanceStatus.data as any)?.records.map((rec: any) => (<Table.Tr key={rec.studentId._id}><Table.Td>{rec.studentId.fullName}</Table.Td><Table.Td>{rec.status}</Table.Td></Table.Tr>))}</Table.Tbody>
                </Table>
            </>
        );
    }

    return (
        <Paper withBorder p="md" mt="md">
            <Text c="dimmed">Date: {new Date().toLocaleDateString()}</Text>
            <Table mt="md" verticalSpacing="md">
                <Table.Thead><Table.Tr><Table.Th>Student Name</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>{students.map(student => (<Table.Tr key={student._id}><Table.Td>{student.fullName}</Table.Td><Table.Td><Radio.Group value={attendance[student._id]} onChange={(value) => handleStatusChange(student._id, value)} name={`attendance-${student._id}`}><Group><Radio value="Present" label="Present" /><Radio value="Absent" label="Absent" color="red" /><Radio value="Late" label="Late" color="orange" /></Group></Radio.Group></Table.Td></Table.Tr>))}</Table.Tbody>
            </Table>
            <Button onClick={handleSubmit} mt="xl" loading={isSubmitting}>Submit Attendance</Button>
        </Paper>
    );
};


// This is the main parent component
const TeacherAttendance = () => {
    const [eligibleClasses, setEligibleClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();
    
    // This is the main data fetching function
    const fetchEligibleClasses = async () => {
        setLoading(true);
        try {
            const startOfWeek = getStartOfWeek(new Date()).toISOString();
            // 1. Fetch the full schedule for the current week
            const response = await axiosPrivate.get('/api/teacher/my-schedule', { params: { weekStartDate: startOfWeek }});
            
            const schedule = response.data.schedule;
            const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();

            // 2. Filter on the frontend to find first period classes for today
            let firstPeriodClasses: any[] = [];
            if (schedule && schedule[dayOfWeek]) {
                firstPeriodClasses = schedule[dayOfWeek].filter((p: any) => p.period === 1);
            }

            setEligibleClasses(firstPeriodClasses);

            // 3. If there's only one eligible class, automatically select it.
            if (firstPeriodClasses.length === 1) {
                setSelectedClassId(firstPeriodClasses[0].classId);
            } else {
                setSelectedClassId(null); // Reset selection if there are multiple or none
            }
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Could not fetch your weekly schedule.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEligibleClasses();
    }, [axiosPrivate]);

    if (loading) return <Center p="xl"><Loader /></Center>;

    const selectedClassInfo = eligibleClasses.find(c => c.classId === selectedClassId);
    const classOptions = eligibleClasses.map(c => ({ value: c.classId, label: c.className }));

    return (
        <>
            <Title order={2} mb="lg">Take Attendance</Title>
            {!eligibleClasses.length ? (
                 <Alert color="blue" title="No Class Assigned for First Period" icon={<IconAlertCircle/>}>
                    You are not assigned to teach the first period for any class today.
                </Alert>
            ) : (
                <Paper withBorder p="md" radius="md">
                    <Title order={4}>Select a Class</Title>
                    <Text c="dimmed" size="sm">You have more than one first-period class today. Please select one to continue.</Text>
                    <Select
                        mt="md"
                        placeholder="Select the class to take attendance for"
                        data={classOptions}
                        value={selectedClassId}
                        onChange={setSelectedClassId}
                        allowDeselect={false}
                    />
                    {selectedClassInfo && <AttendanceForm classInfo={selectedClassInfo} onComplete={fetchEligibleClasses} />}
                </Paper>
            )}
        </>
    );
};

export default TeacherAttendance;