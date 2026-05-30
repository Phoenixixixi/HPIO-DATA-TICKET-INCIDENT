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

export default function Stations() {
    const { alerts } = useSystemStore();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Station Health" />
            <StationsView
                stations={INITIAL_STATIONS}
                alerts={alerts}
                orders={INITIAL_MAINTENANCE_ORDERS}
                technicians={INITIAL_TECHNICIANS}
            />
        </AppLayout>
    );
}
