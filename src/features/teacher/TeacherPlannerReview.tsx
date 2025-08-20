import { useState, useEffect } from 'react';
import { Title, Accordion, Text, Button, Group, Textarea, Modal, Paper } from '@mantine/core';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';

const TeacherPlannerReview = () => {
    const [planners, setPlanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedPlanner, setSelectedPlanner] = useState<any>(null);
    const [declineComment, setDeclineComment] = useState('');

    const fetchPlanners = async () => {
        setLoading(true);
        try {
            const res = await axiosPrivate.get('/api/teacher/guardian-approved-planners');
            setPlanners(res.data);
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'Failed to fetch planners for review.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanners();
    }, []);

    const handleReview = async (status: 'TeacherApproved' | 'TeacherDeclined') => {
        if (!selectedPlanner) return;
        if (status === 'TeacherDeclined' && !declineComment.trim()) {
            notifications.show({ color: 'red', message: 'A comment is required to decline the planner.' });
            return;
        }
        try {
            await axiosPrivate.patch(`/api/teacher/review-planner/${selectedPlanner._id}`, {
                status,
                teacherDeclineComment: status === 'TeacherDeclined' ? declineComment : undefined
            });
            notifications.show({ color: 'green', message: `Planner has been ${status === 'TeacherApproved' ? 'approved' : 'declined'}.`});
            close();
            setDeclineComment('');
            setSelectedPlanner(null);
            fetchPlanners(); // Refresh list
        } catch (error) {
            notifications.show({ color: 'red', message: 'This action failed. Please try again.' });
        }
    };
    
    return (
        <>
            <Title order={2} mb="lg">Review Student Planners</Title>
            {planners.length > 0 ? (
                <Accordion variant="separated">
                    {planners.map(p => (
                        <Accordion.Item key={p._id} value={p._id}>
                            <Accordion.Control>
                                <Text>
                                    Planner for <Text span fw={700}>{p.student.fullName}</Text> on <Text span fw={500}>{new Date(p.date).toLocaleDateString()}</Text>
                                </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Text c="dimmed" size="sm">Guardian Signature: {p.guardianSignature}</Text>
                                <Text mt="sm">
                                    <Text span fw={500}>Student's Goal:</Text> {p.todaysGoal || 'Not set.'}
                                </Text>
                                <Group mt="md">
                                    <Button component={Link} to={`/teacher/planner/${p._id}`} variant="outline">View Full Planner</Button>
                                    <Button color="green" onClick={() => { setSelectedPlanner(p); handleReview('TeacherApproved'); }}>Approve</Button>
                                    <Button color="red" onClick={() => { setSelectedPlanner(p); open(); }}>Decline</Button>
                                </Group>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
             ) : (
                <Paper withBorder p="xl" radius="md">
                    <Text c="dimmed" ta="center">
                        No planners are currently pending your review.
                    </Text>
                </Paper>
            )}
            <Modal opened={opened} onClose={close} title="Decline Planner Comment" centered>
                <Textarea 
                    label="Reason for declining" 
                    placeholder="Provide constructive feedback for the student..."
                    withAsterisk 
                    value={declineComment} 
                    onChange={(e) => setDeclineComment(e.currentTarget.value)} 
                    minRows={3}
                />
                <Button 
                    mt="md" 
                    color="red" 
                    fullWidth 
                    onClick={() => handleReview('TeacherDeclined')}
                >
                    Submit Decline with Comment
                </Button>
            </Modal>
        </>
    );
};

export default TeacherPlannerReview;