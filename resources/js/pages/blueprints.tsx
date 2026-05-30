import ArchitectureView from '@/components/ArchitectureView';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Architecture Blueprints',
        href: '/blueprints',
    },
];

export default function Blueprints() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Architecture Blueprints" />
            <ArchitectureView />
        </AppLayout>
    );
}
