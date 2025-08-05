import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text, Button, Group, Alert, Radio, Loader, Center } from '@mantine/core';
import { IconAlertCircle, IconChecklist } from '@tabler/icons-react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';

const TeacherAttendance = () => {
    const [firstPeriodClass, setFirstPeriodClass] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any>({});
    const [attendanceStatus, setAttendanceStatus] = useState({ isTaken: false, data: null });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const findFirstPeriodClass = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get('/api/teacher/first-period-class-today');
                setFirstPeriodClass(response.data.class);
            } catch (error) {
                notifications.show({ color: 'red', title: 'Error', message: 'Could not verify your schedule.' });
                setFirstPeriodClass(null);
            } finally {
                setLoading(false);
            }
        };
        findFirstPeriodClass();
    }, [axiosPrivate]);
    
    useEffect(() => {
        if (!firstPeriodClass) return;
        const checkAttendanceAndFetchStudents = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const statusRes = await axiosPrivate.get(`/api/teacher/attendance-status/${firstPeriodClass.classId}/${today}`);
                setAttendanceStatus({ isTaken: statusRes.data.taken, data: statusRes.data.data });
                if (!statusRes.data.taken) {
                    const studentRes = await axiosPrivate.get(`/api/teacher/class-students/${firstPeriodClass.classId}`);
                    setStudents(studentRes.data);
                    const initialAttendance = studentRes.data.reduce((acc: any, student: any) => {
                        acc[student._id] = 'Present';
                        return acc;
                    }, {});
                    setAttendance(initialAttendance);
                }
            } catch (error) {
                notifications.show({ color: 'red', title: 'Error', message: 'Failed to load class attendance data.' });
            } finally {
                setLoading(false);
            }
        };
        checkAttendanceAndFetchStudents();
    }, [firstPeriodClass, axiosPrivate]);

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendance((prev: any) => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const records = Object.keys(attendance).map(studentId => ({ studentId, status: attendance[studentId] }));
        try {
            await axiosPrivate.post('/api/teacher/attendance', {
                classId: firstPeriodClass.classId,
                date: new Date().toISOString().split('T')[0],
                records,
            });
            notifications.show({ color: 'green', title: 'Success', message: 'Attendance submitted successfully!' });
            const today = new Date().toISOString().split('T')[0];
            const statusRes = await axiosPrivate.get(`/api/teacher/attendance-status/${firstPeriodClass.classId}/${today}`);
            setAttendanceStatus({ isTaken: statusRes.data.taken, data: statusRes.data.data });
        } catch (error: any) {
            notifications.show({ color: 'red', title: 'Error', message: error.response?.data?.message || 'Failed to submit attendance.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Center p="xl"><Loader /></Center>;

    if (!firstPeriodClass) {
        return <Alert color="blue" title="No Class Assigned for First Period" icon={<IconAlertCircle/>}>You are not assigned to teach the first period for any class today. Attendance can only be taken for the first period.</Alert>;
    }
    
    if (attendanceStatus.isTaken) {
        return (
            <Paper withBorder p="md" radius="md">
                <Title order={3}>Attendance for {firstPeriodClass.className}</Title>
                <Alert color="green" title="Attendance Submitted" mt="md" icon={<IconChecklist />}>Attendance for today has already been taken and is now locked.</Alert>
                <Table mt="md" highlightOnHover><Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{(attendanceStatus.data as any)?.records.map((rec: any) => (<Table.Tr key={rec.studentId._id}><Table.Td>{rec.studentId.fullName}</Table.Td><Table.Td>{rec.status}</Table.Td></Table.Tr>))}</Table.Tbody></Table>
            </Paper>
        );
    }
    
    return (
        <Paper withBorder p="md" radius="md">
            <Title order={3}>Take Attendance: {firstPeriodClass.className}</Title>
            <Text c="dimmed">Date: {new Date().toLocaleDateString()}</Text>
            <Table mt="md" verticalSpacing="md"><Table.Thead><Table.Tr><Table.Th>Student Name</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{students.map(student => (<Table.Tr key={student._id}><Table.Td>{student.fullName}</Table.Td><Table.Td><Radio.Group value={attendance[student._id]} onChange={(value) => handleStatusChange(student._id, value)} name={`attendance-${student._id}`}><Group><Radio value="Present" label="Present" /><Radio value="Absent" label="Absent" color="red" /><Radio value="Late" label="Late" color="orange" /></Group></Radio.Group></Table.Td></Table.Tr>))}</Table.Tbody></Table>
            <Button onClick={handleSubmit} mt="xl" loading={isSubmitting}>Submit Attendance</Button>
        </Paper>
    );
};
export default TeacherAttendance;