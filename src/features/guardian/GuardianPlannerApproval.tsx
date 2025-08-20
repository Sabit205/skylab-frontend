import { useState, useEffect } from 'react';
import { Title, Paper, Accordion, Text, Button, Group } from '@mantine/core';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';

const GuardianPlannerApproval = () => {
    const [planners, setPlanners] = useState<any[]>([]);
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    
    const fetchPlanners = async () => {
        try {
            const res = await axiosPrivate.get('/api/guardian/pending-planners');
            setPlanners(res.data);
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'Failed to fetch pending planners.',
            });
        }
    };

    useEffect(() => {
        fetchPlanners();
    }, []);

    const handleApprove = async (plannerId: string) => {
        try {
            // Use the student's name from the auth context as the signature
            await axiosPrivate.patch(`/api/guardian/approve-planner/${plannerId}`, {
                signature: auth.user?.studentName
            });
            notifications.show({ color: 'green', title: 'Success', message: 'Planner approved and sent to the class teacher!' });
            fetchPlanners(); // Refresh the list to remove the approved planner
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to approve the planner.' });
        }
    };

    return (
        <>
            <Title order={2} mb="lg">Pending Planners for Approval</Title>
            {planners.length > 0 ? (
                <Accordion variant="separated">
                    {planners.map(p => (
                        <Accordion.Item key={p._id} value={p._id}>
                            <Accordion.Control>
                                <Text>
                                    Planner for <Text span fw={500}>{new Date(p.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                                </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Text size="sm">Review the full planner to see your child's daily activities and goals before approving.</Text>
                                <Group mt="md">
                                    <Button component={Link} to={`/guardian/planner/${p._id}`} variant="outline">
                                        View Full Planner
                                    </Button>
                                    <Button color="green" onClick={() => handleApprove(p._id)}>
                                        Approve Planner
                                    </Button>
                                </Group>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            ) : (
                <Paper withBorder p="xl" radius="md">
                    <Text c="dimmed" ta="center">
                        No planners are currently pending your approval.
                    </Text>
                </Paper>
            )}
        </>
    );
};

export default GuardianPlannerApproval;