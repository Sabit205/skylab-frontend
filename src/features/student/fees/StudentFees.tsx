import { useState, useEffect, useRef } from 'react';
import { Title, Paper, Table, Text, Badge, ActionIcon, Modal, Button, Group } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { useDisclosure } from '@mantine/hooks';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { notifications } from '@mantine/notifications';
import Receipt from '../../admin/fees/Receipt';

interface StudentFeesProps {
    isGuardian?: boolean;
}

const StudentFees = ({ isGuardian = false }: StudentFeesProps) => {
    const [fees, setFees] = useState<any[]>([]);
    const [selectedFee, setSelectedFee] = useState<any>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const endpoint = isGuardian ? '/api/guardian/my-fees' : '/api/student/my-fees';
        axiosPrivate.get(endpoint).then(res => {
            setFees(res.data);
        }).catch(error => {
            console.error("Failed to fetch fee history", error);
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'Could not load fee history.'
            });
        });
    }, [axiosPrivate, isGuardian]);

    const handleDownloadPdf = async () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement || !selectedFee) return;

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
            pdf.save(`Fee-Receipt-${selectedFee.studentIndex}.pdf`);
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Could not generate PDF' });
        } finally {
            setPdfLoading(false);
        }
    };

    const handleDownloadClick = (fee: any) => {
        setSelectedFee(fee);
        open();
    };

    const rows = fees.map(fee => (
        <Table.Tr key={fee._id}>
            <Table.Td>{fee.months.join(', ')}</Table.Td>
            <Table.Td>৳{fee.amount.toLocaleString()}</Table.Td>
            <Table.Td>
                <Badge color="green" variant="light">Paid</Badge>
            </Table.Td>
            <Table.Td>{new Date(fee.createdAt).toLocaleDateString()}</Table.Td>
            <Table.Td>
                <ActionIcon variant="light" onClick={() => handleDownloadClick(fee)} title="Download Receipt">
                    <IconDownload size={16} />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Title order={2} mb="lg">Fee Payment History</Title>
            <Paper withBorder p="md" radius="md">
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Month(s) Paid For</Table.Th>
                            <Table.Th>Amount Paid</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Payment Date</Table.Th>
                            <Table.Th>Receipt</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Text c="dimmed" ta="center" p="xl">You have no payment history.</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            <Modal opened={opened} onClose={close} title="Receipt" size="xl" centered>
                {selectedFee && (
                    <Receipt 
                        ref={receiptRef} 
                        receiptData={selectedFee} 
                    />
                )}
                <Group justify="flex-end" mt="md">
                    <Button 
                        onClick={handleDownloadPdf} 
                        loading={pdfLoading} 
                        leftSection={<IconDownload size={16} />}
                    >
                        Download PDF
                    </Button>
                </Group>
            </Modal>
        </>
    );
};
export default StudentFees;