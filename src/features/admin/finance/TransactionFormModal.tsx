import { Modal, TextInput, Select, NumberInput, Button, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { useEffect } from 'react';

// --- THE DEFINITIVE FIX ---
// The problematic options object has been removed from z.date.
// We use a refinement to ensure the date is not null, which provides a better error message.
const schema = z.object({
    type: z.enum(['Revenue', 'Expense']),
    category: z.string().min(3, { message: 'Category is required' }),
    amount: z.number().min(1, { message: 'Amount must be greater than 0' }),
    date: z.date().nullable().refine(val => val !== null, { message: 'Please select a date' }),
});

const TransactionFormModal = ({ opened, onClose, onSubmit, transaction }: any) => {
    const isEditMode = !!transaction;
    const form = useForm({
        initialValues: { type: 'Revenue' as 'Revenue' | 'Expense', category: '', amount: 0, date: new Date() },
    });

    useEffect(() => {
        if (transaction) {
            form.setValues({ ...transaction, date: new Date(transaction.date) });
        } else {
            form.reset();
        }
    }, [transaction, opened]);
    
    const handleSubmit = () => {
        const result = schema.safeParse(form.values);
        if (!result.success) {
            form.setErrors(result.error.flatten().fieldErrors);
            return;
        }
        onSubmit(result.data);
    };

    return (
        <Modal opened={opened} onClose={close} title={isEditMode ? 'Edit Transaction' : 'Add Transaction'}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Select label="Type" data={['Revenue', 'Expense']} required {...form.getInputProps('type')} />
                <TextInput label="Category" placeholder="e.g., Tuition Fees" required mt="md" {...form.getInputProps('category')} />
                <NumberInput label="Amount" prefix="৳" required hideControls mt="md" {...form.getInputProps('amount')} />
                <DateInput label="Date" required mt="md" {...form.getInputProps('date')} />
                <Group justify="flex-end" mt="xl"><Button variant="default" onClick={onClose}>Cancel</Button><Button type="submit">{isEditMode ? 'Update' : 'Add'}</Button></Group>
            </form>
        </Modal>
    );
};
export default TransactionFormModal;