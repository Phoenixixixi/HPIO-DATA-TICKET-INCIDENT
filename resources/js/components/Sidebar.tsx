/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Building2, 
  FileCode2,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unresolvedAlertsCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, unresolvedAlertsCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard Hub', icon: LayoutDashboard },
    { id: 'incident', name: 'Incident Management', icon: ShieldAlert },
    { id: 'stations', name: 'Station Health', icon: Building2 },
    { id: 'blueprints', name: 'Architecture Blueprints', icon: FileCode2 },
  ];

  return (
    <aside className="w-[240px] bg-[#1A1C1E] flex flex-col justify-between h-screen shrink-0 text-white font-sans border-r border-white/5">
      <div className="flex flex-col">
        
        {/* KCIC Brand Logo Block */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-[#C8102E] rounded-[4px] flex items-center justify-center font-bold text-lg italic text-white shrink-0 select-none">
            K
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight text-white m-0">KCIC</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none mt-1 font-mono">HPIO Dashboard</p>
          </div>
        </div>

        {/* Menu Navigation items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-[4px] text-xs font-semibold transition-colors duration-150 ${
                  isActive 
                    ? 'bg-[#C8102E]/10 border-l-4 border-[#C8102E] text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C8102E]' : ''}`} />
                  <span>{item.name}</span>
                </div>
                
                {item.id === 'dashboard' && unresolvedAlertsCount > 0 && (
                  <span className="bg-[#C8102E] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] font-mono leading-none">
                    {unresolvedAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* User Session card in Footer */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[10px] text-blue-300 font-bold shrink-0">
            RI
          </div>
          <div className="text-xs truncate">
            <p className="font-semibold text-white leading-tight">Rakha Ismail</p>
            <p className="text-white/40 text-[10px] mt-0.5">Chief Engineer (HQ)</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
