import StationsView from '@/components/StationsView';
import AppLayout from '@/layouts/app-layout';
import { useSystemStore } from '@/systemStore';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { INITIAL_STATIONS, INITIAL_MAINTENANCE_ORDERS, INITIAL_TECHNICIANS } from '@/data';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Station Health',
        href: '/stations',
    },
];

interface ShiftScheduleRow {
    id: number;
    employee_name: string;
    nip: string | null;
    no_hp: string | null;
    month: string;
    shifts: Record<number, string>;
}

interface StationsProps {
    shift_schedules?: ShiftScheduleRow[];
    today_day?: number;
    station_incidents?: Record<string, { total: number; closed: number }>;
}

export default function Stations({ shift_schedules = [], today_day, station_incidents = {} }: StationsProps) {
    const { alerts } = useSystemStore();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Station Health" />
            <StationsView
                stations={INITIAL_STATIONS}
                alerts={alerts}
                orders={INITIAL_MAINTENANCE_ORDERS}
                technicians={INITIAL_TECHNICIANS}
                shift_schedules={shift_schedules}
                today_day={today_day}
                station_incidents={station_incidents}
            />
        </AppLayout>
    );
}
