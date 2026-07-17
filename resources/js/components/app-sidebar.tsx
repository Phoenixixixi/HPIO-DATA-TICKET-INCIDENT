import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutDashboard, ShieldAlert, Building2, FileCode2, BookOpen, Folder, ClipboardList, CalendarDays, ClipboardCheck } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard Hub',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Incident Management',
        url: '/incident',
        icon: ShieldAlert,
    },
    {
        title: 'Station Health',
        url: '/stations',
        icon: Building2,
    },
    // {
    //     title: 'Architecture Blueprints',
    //     url: '/blueprints',
    //     icon: FileCode2,
    // },
    {
        title: 'Shift Schedule',
        url: '/shift-schedule',
        icon: CalendarDays,
    },
    {
        title: 'Form Report',
        url: '/form-report',
        icon: ClipboardCheck,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
