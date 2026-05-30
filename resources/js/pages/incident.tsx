import IncidentView from '@/components/IncidentView';
import AppLayout from '@/layouts/app-layout';
import { IncidentLog } from '@/types';
import { Head } from '@inertiajs/react';


export interface Props {
    incident_log: IncidentLog
    data_count: {
        total: number,
        total_p1: number,
        total_p2: number,
        total_close: number,
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Incident Management',
        href: '/incident',
    },
];



export default function Incident({ incident_log, data_count }: Props) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Incident Management" />
            <IncidentView incident_log={incident_log} data_count={data_count} />
        </AppLayout>
    );
}
