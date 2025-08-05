import { useState, useEffect } from 'react';
import { Title, Paper, Table, Select } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const StudentResults = () => {
    const [results, setResults] = useState<any[]>([]);
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        axiosPrivate.get('/api/student/my-results').then(res => {
            setResults(res.data);
            if (res.data.length > 0) {
                setSelectedExam(res.data[0]._id);
            }
        });
    }, [axiosPrivate]);
    
    const examOptions = results.map(r => ({ value: r._id, label: r.examType }));
    const selectedResult = results.find(r => r._id === selectedExam);

    const rows = selectedResult?.results.map((res: any, index: number) => (
        <Table.Tr key={index}>
            <Table.Td>{res.subjectName}</Table.Td>
            <Table.Td>{res.marks}</Table.Td>
            <Table.Td>{res.grade}</Table.Td>
            <Table.Td>{res.remarks}</Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">My Academic Results</Title>
            <Select label="Select Exam" data={examOptions} value={selectedExam} onChange={setSelectedExam} mb="xl" />
            
            {selectedResult && (
                <Paper withBorder p="md" radius="md">
                    <Table verticalSpacing="sm">
                        <Table.Thead><Table.Tr><Table.Th>Subject</Table.Th><Table.Th>Marks</Table.Th><Table.Th>Grade</Table.Th><Table.Th>Remarks</Table.Th></Table.Tr></Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Paper>
            )}
            {selectedResult && (
                 <Paper withBorder p="md" radius="md" mt="xl">
                    <Title order={4} mb="md">Performance Overview</Title>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={selectedResult.results}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="subjectName" /><YAxis /><Tooltip /><Bar dataKey="marks" fill="#8884d8" /></BarChart>
                    </ResponsiveContainer>
                </Paper>
            )}
        </>
    );
};
export default StudentResults;