export default function AppLogo() {
    return (
        <>
            <div className="bg-[#C8102E] text-white flex aspect-square size-8 items-center justify-center rounded-[4px] font-bold text-lg italic select-none">
                K
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm font-bold text-sidebar-foreground leading-tight">KCIC</span>
                <span className="truncate text-[9px] text-muted-foreground uppercase tracking-widest font-mono leading-none">HPIO Dashboard</span>
            </div>
        </>
    );
}
