import React from 'react';
import { Paper, Text, Title, Group, Stack, Divider, Box, Image } from '@mantine/core';
import logo from '../../../assets/logo.svg'; // Import the logo from the assets folder

interface ReceiptProps {
    receiptData: any;
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ receiptData }, ref) => {
    if (!receiptData) {
        return null;
    }

    const { studentName, studentIndex, className, amount, months, notes, collectedBy, createdAt, _id } = receiptData;

    // All text components now have `c="black"` to ensure they are black in the PDF
    return (
        <Box ref={ref} p="md">
            <Paper withBorder p="xl" radius="md" bg="white">
                <Stack>
                    <Group justify="space-between" align="flex-start">
                        <Stack gap={0}>
                            <Title order={3} c="black">Your School Name</Title>
                            <Text c="dimmed" size="sm">123 School Lane, City, Country</Text>
                        </Stack>
                        <Image src={logo} alt="School Logo" w={60} h={60} />
                    </Group>

                    <Divider my="md" label={<Text fw={500} c="black">Official Fee Receipt</Text>} />

                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text size="sm" c="dimmed">BILLED TO</Text>
                            <Text fw={500} c="black">{studentName}</Text>
                            <Text c="black">Index: {studentIndex}</Text>
                            <Text c="black">Class: {className}</Text>
                        </Stack>
                        <Stack gap="xs" align="flex-end">
                            <Text size="sm" c="dimmed">RECEIPT DETAILS</Text>
                            <Text c="black">Receipt #: {_id.slice(-6).toUpperCase()}</Text>
                            <Text c="black">Payment Date: {new Date(createdAt).toLocaleDateString()}</Text>
                        </Stack>
                    </Group>

                    <Divider my="sm" />

                    <Group justify="space-between"><Text fw={500} c="black">Fee for Month(s)</Text><Text c="black">{months.join(', ')}</Text></Group>
                    <Group justify="space-between"><Text fw={500} c="black">Notes</Text><Text c="black" style={{ maxWidth: '200px', textAlign: 'right' }}>{notes || 'N/A'}</Text></Group>
                    
                    <Divider my="md" />

                    <Group justify="space-between"><Title order={4} c="black">Amount Paid</Title><Title order={4} c="black">৳{amount.toLocaleString()}</Title></Group>
                    
                    <Divider my="md" />

                    <Text size="xs" c="dimmed" ta="center">Payment collected by: {collectedBy?.fullName || 'Admin'}. Thank you for your payment!</Text>
                </Stack>
            </Paper>
        </Box>
    );
});

export default Receipt;