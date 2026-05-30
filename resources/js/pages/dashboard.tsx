import DashboardView from '@/components/DashboardView';
import AppLayout from '@/layouts/app-layout';
import { useSystemStore } from '@/systemStore';
import { type BreadcrumbItem, type Incident } from '@/types';
import { Head } from '@inertiajs/react';
import { INITIAL_MAINTENANCE_ORDERS, INITIAL_STATIONS } from '@/data';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Hub',
        href: '/dashboard',
    },
];

export interface DashboardProps {
    data_dashboard: {
        data_perangkat: { kategori_aset: string; total: number }[];
        data_open: number;
        incidents: Incident[];
    };
}

export default function Dashboard({ data_dashboard }: DashboardProps) {
    const { alerts, trains, resolveAlert, simulateFault } = useSystemStore();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Hub" />
            <DashboardView
                alerts={alerts}
                orders={INITIAL_MAINTENANCE_ORDERS}
                stations={INITIAL_STATIONS}
                trains={trains}
                onResolveAlert={resolveAlert}
                onSimulateFault={simulateFault}
                data_dashboard={data_dashboard}
            />
        </AppLayout>
    );
}
