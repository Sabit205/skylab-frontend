import { useState, useEffect } from 'react';
import { Title, Paper, Table, Text, Select, Avatar, Group, TextInput } from '@mantine/core';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { useDebouncedValue } from '@mantine/hooks';

const TeacherClasses = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        // Fetch initial data: all students and all classes
        const fetchData = async () => {
            try {
                const [studentRes, classRes] = await Promise.all([
                    axiosPrivate.get('/users?role=Student&limit=1000'), // Get a large number of students
                    axiosPrivate.get('/classes')
                ]);
                setAllStudents(studentRes.data.users);
                setStudents(studentRes.data.users);
                setClasses(classRes.data.map((c: any) => ({ value: c._id, label: c.name })));
            } catch (error) {
                console.error("Failed to fetch initial class/student data", error);
            }
        };
        fetchData();
    }, [axiosPrivate]);
    
    useEffect(() => {
        // Filter students based on search term
        let filteredStudents = allStudents;
        if(debouncedSearch){
            filteredStudents = allStudents.filter(s => 
                s.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (s.indexNumber && s.indexNumber.toLowerCase().includes(debouncedSearch.toLowerCase()))
            );
        }
        // In a real app, you would also filter by selectedClass here
        // For this demo, the class filter is just a UI element
        setStudents(filteredStudents);

    }, [debouncedSearch, selectedClass, allStudents]);

    const rows = students.map(student => (
        <Table.Tr key={student._id}>
            <Table.Td>
                <Group>
                    <Avatar size="sm" radius="xl" /> 
                    <Text>{student.fullName}</Text>
                </Group>
            </Table.Td>
            <Table.Td>{student.indexNumber}</Table.Td>
            {/* <Table.Td>Grade 10 - A</Table.Td> In a real app, this would be dynamic */}
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">Student Directory</Title>
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                     <TextInput 
                        placeholder="Search by name or index..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        style={{flex: 1}}
                    />
                    <Select
                        label="Filter by Class"
                        placeholder="Select a class"
                        data={classes}
                        value={selectedClass}
                        onChange={setSelectedClass}
                        clearable
                        style={{minWidth: 200}}
                        searchable
                    />
                </Group>
                 <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Student Name</Table.Th>
                            <Table.Th>Index Number</Table.Th>
                            {/* <Table.Th>Class</Table.Th> */}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={2}>
                                    <Text c="dimmed" ta="center" p="xl">No students found matching your criteria.</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>
        </>
    );
};

// FIX: Add the default export statement
export default TeacherClasses;