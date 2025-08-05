import { useState, useRef } from 'react';
import { TextInput, Button, Group, Title, Paper, Text, Alert, MultiSelect, NumberInput, Textarea, Loader, Center } from '@mantine/core';
import { IconSearch, IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { notifications } from '@mantine/notifications';
import Receipt from './Receipt';

const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const feeSchema = z.object({
    months: z.array(z.string()).min(1, { message: 'At least one month must be selected' }),
    amount: z.number().min(1, { message: 'Amount must be greater than 0' }),
    notes: z.string().optional(),
});

const FeeCollection = () => {
    const [indexNumber, setIndexNumber] = useState('');
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receiptData, setReceiptData] = useState<any>(null);
    const axiosPrivate = useAxiosPrivate();
    const receiptRef = useRef<HTMLDivElement>(null);
    const form = useForm({ initialValues: { months: [], amount: 0, notes: '' } });

    const handleFindStudent = async () => {
        if (!indexNumber) return;
        setLoading(true);
        setError(null);
        setStudent(null);
        setReceiptData(null);
        form.reset();
        try {
            const response = await axiosPrivate.get(`/fees/student-lookup/${indexNumber}`);
            setStudent(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred while finding the student.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement) return;

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
            pdf.save(`Fee-Receipt-${receiptData.studentIndex}.pdf`);
        } catch (error) {
            notifications.show({ color: 'red', title: 'Error', message: 'Could not generate PDF' });
        } finally {
            setPdfLoading(false);
        }
    };
    
    const handleCollectFee = async () => {
        const result = feeSchema.safeParse(form.values);
        if(!result.success) {
            form.setErrors(result.error.flatten().fieldErrors);
            return;
        }
        if (!student) return;
        setLoading(true);
        try {
            const payload = {
                ...result.data,
                studentId: student._id,
                classId: student.class._id,
                studentName: student.fullName,
                studentIndex: student.indexNumber,
                className: student.class.name,
            };
            const response = await axiosPrivate.post('/fees', payload);
            setReceiptData(response.data);
            notifications.show({ color: 'green', title: 'Success', message: 'Fee collected and receipt generated!' });
        } catch (err) {
            notifications.show({ color: 'red', title: 'Error', message: 'Failed to collect fee' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Title order={2} mb="lg">Student Fee Collection</Title>
            <Paper withBorder p="md" radius="md">
                <Group>
                    <TextInput style={{ flex: 1 }} placeholder="Enter student index number to begin" value={indexNumber} onChange={(e) => setIndexNumber(e.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleFindStudent(); }} />
                    <Button onClick={handleFindStudent} loading={loading} leftSection={<IconSearch size={16} />}>Find Student</Button>
                </Group>
                {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} mt="md">{error}</Alert>}
            </Paper>
            {loading && !student && <Center mt="xl"><Loader /></Center>}
            {student && !receiptData && (
                <Paper withBorder p="md" radius="md" mt="xl">
                    <Title order={4} mb="sm">Student Information</Title>
                    <Group><Text fw={500}>Name:</Text><Text>{student.fullName}</Text><Text fw={500}>Index #:</Text><Text>{student.indexNumber}</Text><Text fw={500}>Class:</Text><Text>{student.class.name}</Text></Group>
                    <form onSubmit={(e) => { e.preventDefault(); handleCollectFee(); }}>
                        <Title order={4} mt="xl" mb="sm">Fee Details</Title>
                        <MultiSelect data={monthOptions} label="Fee for Month(s)" placeholder="Select one or more months" required {...form.getInputProps('months')} />
                        <NumberInput label="Amount" prefix="৳" required hideControls mt="md" {...form.getInputProps('amount')} />
                        <Textarea label="Notes (Optional)" placeholder="Any notes about this payment (e.g., late fee)" mt="md" {...form.getInputProps('notes')} />
                        <Button type="submit" mt="xl" loading={loading}>Generate Receipt</Button>
                    </form>
                </Paper>
            )}
            {receiptData && (
                <Paper withBorder p="md" radius="md" mt="xl">
                     <Title order={4} mb="sm">Receipt Preview</Title>
                     <Receipt ref={receiptRef} receiptData={receiptData} />
                     <Group mt="md"><Button onClick={handleDownloadPdf} loading={pdfLoading} leftSection={<IconDownload size={16} />}>Download as PDF</Button><Button variant="default" onClick={() => { setReceiptData(null); form.reset(); }}>Collect Another Fee</Button></Group>
                </Paper>
            )}
        </>
    );
};
export default FeeCollection;