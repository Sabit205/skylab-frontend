import React from 'react';
import { TextInput, Select, Stack } from '@mantine/core';

// Define the props the component will receive
interface PeriodCellProps {
    day: string;
    period: number;
    subject: string;
    teacher: string | null;
    teachersList: { value: string; label: string }[];
    onUpdate: (day: string, period: number, field: 'subject' | 'teacher', value: string | null) => void;
}

// This is a "dumb" or "controlled" component. It holds no state of its own.
// It receives values as props and calls the parent's `onUpdate` function on every change.
const PeriodCell = ({ day, period, subject, teacher, teachersList, onUpdate }: PeriodCellProps) => {
    return (
        <Stack>
            <TextInput
                placeholder="Subject"
                // The value is directly controlled by the parent's state via props
                value={subject}
                // Every keystroke immediately calls the parent's update function
                onChange={(e) => onUpdate(day, period, 'subject', e.currentTarget.value)}
            />
            <Select
                placeholder="Select Teacher"
                data={teachersList}
                // The value is directly controlled by the parent's state via props
                value={teacher}
                // Every selection immediately calls the parent's update function
                onChange={(value) => onUpdate(day, period, 'teacher', value)}
                searchable
                clearable
            />
        </Stack>
    );
};

// By wrapping the component in React.memo, we prevent it from re-rendering
// if its props (subject, teacher, etc.) have not changed since the last render.
// This is the key to the performance fix.
export default React.memo(PeriodCell);