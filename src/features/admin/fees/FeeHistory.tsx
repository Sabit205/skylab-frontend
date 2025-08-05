import { useState, useEffect, useRef } from 'react';
import { Table, Pagination, Group, Title, Paper, TextInput, Select, Text, ActionIcon, Modal, Button } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconSearch, IconDownload } from '@tabler/icons-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import Receipt from './Receipt';
import { notifications } from '@mantine/notifications';

const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const FeeHistory = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [activePage, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState<string | null>(null);
    const [debouncedSearch] = useDebouncedValue(searchTerm, 500);
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const receiptRef = useRef<HTMLDivElement>(null);

    // --- NEW EFFICIENT A6 PDF DOWNLOAD LOGIC ---
    const handleDownloadPdf = async () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement || !selectedPayment) return;

        setPdfLoading(true);
        try {
            const canvas = await html2canvas(receiptElement, { scale: 3 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a6');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const finalImgWidth = imgWidth * ratio;
            const finalImgHeight = imgHeight * ratio;
            
            const x = (pdfWidth - finalImgWidth) / 2;
            const y = (pdfHeight - finalImgHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
            pdf.save(`Fee-Receipt-${selectedPayment.studentIndex}.pdf`);
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Could not generate PDF' });
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await axiosPrivate.get('/fees/history', {
                    params: { page: activePage, limit: 10, indexNumber: debouncedSearch, month: monthFilter }
                });
                setPayments(data.fees);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error("Failed to fetch fee history", error);
            }
        };
        fetchHistory();
    }, [activePage, debouncedSearch, monthFilter, axiosPrivate]);
    
    const handleReprint = (payment: any) => {
        setSelectedPayment(payment);
        open();
    };

    const rows = payments.map((p) => (
        <Table.Tr key={p._id}>
            <Table.Td>{p.studentName}</Table.Td>
            <Table.Td>{p.studentIndex}</Table.Td>
            <Table.Td>৳{p.amount.toLocaleString()}</Table.Td>
            <Table.Td>{p.months.join(', ')}</Table.Td>
            <Table.Td>{new Date(p.createdAt).toLocaleDateString()}</Table.Td>
            <Table.Td>{p.collectedBy.fullName}</Table.Td>
            <Table.Td>
                <ActionIcon variant="light" onClick={() => handleReprint(p)} title="Download Receipt">
                    <IconDownload size={16} />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">Fee Payment History</Title>
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <TextInput placeholder="Search by Index Number..." leftSection={<IconSearch size={14} />} value={searchTerm} onChange={(e) => setSearchTerm(e.currentTarget.value)} style={{ flex: 1 }} />
                    <Select placeholder="Filter by Month" data={monthOptions} value={monthFilter} onChange={setMonthFilter} clearable />
                </Group>
                <Table miw={800} verticalSpacing="sm" highlightOnHover>
                    <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Index #</Table.Th><Table.Th>Amount</Table.Th><Table.Th>Months</Table.Th><Table.Th>Date</Table.Th><Table.Th>Collected By</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={7}><Text c="dimmed" ta="center" mt="xl">No payment records found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
                </Table>
            </Paper>
             <Group justify="center" mt="md">
                <Pagination total={totalPages} value={activePage} onChange={setPage} />
            </Group>

            <Modal opened={opened} onClose={close} title="Download Receipt" size="xl">
                {selectedPayment && <Receipt ref={receiptRef} receiptData={selectedPayment} />}
                <Group justify="flex-end" mt="md">
                    <Button onClick={handleDownloadPdf} loading={pdfLoading} leftSection={<IconDownload size={16} />}>Download PDF</Button>
                    <Button variant='default' onClick={close}>Close</Button>
                </Group>
            </Modal>
        </>
    );
};

export default FeeHistory;