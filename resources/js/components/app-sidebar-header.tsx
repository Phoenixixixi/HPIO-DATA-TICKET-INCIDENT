import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useSystemStore } from '@/systemStore';
import { BellRing } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const liveToast = useSystemStore((state) => state.liveToast);

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 relative">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 select-none">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>SUPABASE REALTIME CONNECTED</span>
                </div>
            </div>

            {/* Toast overlay */}
            {liveToast && (
                <div className="absolute top-20 right-8 z-50 animate-slide-in-fade select-none">
                    <div className="p-4 rounded-[4px] border border-gray-205 shadow-lg flex items-start gap-3 max-w-sm bg-neutral-900/95 text-white">
                        <BellRing className="w-5 h-5 shrink-0 text-amber-400" />
                        <div className="space-y-1 font-sans text-xs">
                            <span className="font-bold block uppercase tracking-wide text-[9px] font-mono text-gray-400">
                                SUPABASE REALTIME CHANNEL
                            </span>
                            <p className="leading-normal">{liveToast.message}</p>
                            <span className="text-[9px] text-[#C8102E] font-mono block pt-1 uppercase font-bold">
                                TRANSACT LOCK SYNCED
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
