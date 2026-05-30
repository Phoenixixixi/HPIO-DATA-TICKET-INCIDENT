import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useSystemStore } from '@/systemStore';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const alerts = useSystemStore((state) => state.alerts);
    const unresolvedAlertsCount = alerts.filter((a) => !a.resolved_at).length;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.url === page.url}>
                            <Link href={item.url} prefetch className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </div>
                                {item.url === '/dashboard' && unresolvedAlertsCount > 0 && (
                                    <span className="bg-[#C8102E] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] font-mono leading-none select-none">
                                        {unresolvedAlertsCount}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
