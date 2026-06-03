import ShiftScheduleView from '@/components/ShiftScheduleView';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export interface ShiftConfig {
    id: number;
    shift_name: string;
    start_time: string;
    end_time: string;
}

export interface ShiftRow {
    id: number;
    employee_name: string;
    nip: string | null;
    no_hp: string | null;
    month: string;
    shifts: Record<number, string>;
    sort_order: number;
}

export interface Props {
    shifts: ShiftRow[];
    month: string;
    configs: ShiftConfig[];
}

export default function ShiftSchedule({ shifts, month, configs }: Props) {
    return (
        <AppLayout>
            <Head title="Shift Schedule" />
            <ShiftScheduleView shifts={shifts} month={month} configs={configs} />
        </AppLayout>
    );
}
