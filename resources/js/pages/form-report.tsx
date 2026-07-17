import FormReportView from '@/components/FormReportView';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Form Report', href: '/form-report' },
];

export interface FormReportRow {
    id: number;
    nama_teknisi: string;
    time_report: string;
    location: string | null;
    description: string;
    start_time: string | null;
    end_time: string | null;
    evidence: string | null;
    created_at: string;
    updated_at: string;
}

export interface FormReportPaginated {
    data: FormReportRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface FormReportSummary {
    total: number;
    this_month: number;
    today: number;
}

export interface FormReportProps {
    reports: FormReportPaginated;
    locations: string[];
    filters: Record<string, string>;
    summary: FormReportSummary;
}

export default function FormReport({ reports, locations, filters, summary }: FormReportProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Report" />
            <FormReportView
                reports={reports}
                locations={locations}
                filters={filters}
                summary={summary}
            />
        </AppLayout>
    );
}
