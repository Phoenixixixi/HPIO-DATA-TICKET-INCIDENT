/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Train, 
  Activity, 
  Wrench, 
  History, 
  BadgeAlert, 
  Settings2, 
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { TrainSet, MaintenanceOrder } from '../types';

interface TrainsViewProps {
  trains: TrainSet[];
  orders: MaintenanceOrder[];
  onUpdateTrainStatus: (id: string, status: any) => void;
}

export default function TrainsView({ trains, orders, onUpdateTrainStatus }: TrainsViewProps) {
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(trains[0]?.id || null);

  const selectedTrain = trains.find(t => t.id === selectedTrainId);
  const selectedTrainHistory = orders.filter(o => o.train_set_id === selectedTrainId);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-250';
      case 'maintenance': return 'bg-[#C8102E] text-white font-semibold shadow-sm animate-pulse-slow';
      case 'decommissioned': return 'bg-gray-500 text-white font-semibold';
      default: return 'bg-yellow-500 text-gray-900';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return '🟢 Operational';
      case 'maintenance': return '🔧 Maintenance';
      case 'decommissioned': return '🔴 Decommissioned';
      default: return '⚠️ Unknown';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F4F5F7] text-gray-800">
      
      {/* LEFT: Trains Grid */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 m-0 leading-none">Whoosh Fleet Active Roster</h2>
          <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider select-none">HSR Motor and Chassis Control Status</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {trains.map(train => {
            const isActiveSelection = train.id === selectedTrainId;
            const ongoingMaintenance = orders.some(o => o.train_set_id === train.id && (o.status === 'pending' || o.status === 'in_progress'));
            
            return (
              <div
                key={train.id}
                onClick={() => setSelectedTrainId(train.id)}
                className={`cursor-pointer border rounded-[4px] p-5 flex flex-col justify-between transition-all select-none ${
                  isActiveSelection 
                    ? 'bg-white border-[#C8102E] shadow-sm ring-1 ring-[#C8102E]/20' 
                    : 'bg-white border-gray-200 hover:border-gray-305 hover:shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Train className={`w-4 h-4 ${train.status === 'maintenance' ? 'text-kcic-red' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-gray-900 font-mono">{train.train_number}</span>
                    </div>
                    {ongoingMaintenance && (
                      <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-ping" title="Active order logged"></span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1 font-sans text-xs">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Model series</span>
                    <span className="text-[11px] font-semibold text-gray-800 font-mono leading-none">{train.model}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  {/* Status Indicator Bar */}
                  <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-[4px] ${getStatusStyle(train.status)}`}>
                    {train.status}
                  </span>

                  <span className="text-[10px] text-gray-400 font-mono">
                    {orders.filter(o => o.train_set_id === train.id).length} jobs logged
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Detail Log Drawer */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col p-5 space-y-4 overflow-y-auto shrink-0 font-sans">
        {selectedTrain ? (
          <>
            <div className="border-b border-gray-100 pb-3 space-y-1">
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest block font-bold">CO-PILOT FLEET ASSESS</span>
              <h2 className="text-base font-bold text-gray-900">{selectedTrain.train_number}</h2>
              <p className="text-[10px] text-gray-400 font-mono">SPEC: EIGA SEVERE DUTY CR400AF</p>
            </div>

            {/* Quick action: Update operable status */}
            <div className="p-4 bg-gray-50 border border-gray-150/85 rounded-[4px] space-y-2.5 shadow-sm">
              <div className="flex items-center gap-1">
                <Settings2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-mono font-bold text-gray-450 uppercase">Update Operability Tags</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal font-sans">Admin Override: Alter train-status manually triggers DB triggers updating dispatcher streams.</p>
              
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {['operational', 'maintenance', 'decommissioned'].map((stState) => {
                  const isCurrent = selectedTrain.status === stState;
                  return (
                    <button
                      key={stState}
                      disabled={isCurrent}
                      onClick={() => onUpdateTrainStatus(selectedTrain.id, stState as any)}
                      className={`px-2 py-1 text-[10px] font-mono rounded-[4px] font-bold transition-all uppercase cursor-pointer ${
                        isCurrent 
                          ? 'bg-neutral-800 text-white cursor-not-allowed opacity-50' 
                          : 'bg-white hover:bg-neutral-100 border border-gray-200 text-gray-700'
                      }`}
                    >
                      {stState}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Past Work Cycles */}
            <div className="space-y-3 flex-1 flex flex-col">
              <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-450 flex items-center gap-1 shrink-0">
                <History className="w-3.5 h-3.5" />
                <span>Ticket Auditing Log</span>
                <span className="bg-[#F4F5F7] border border-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-[4px] font-mono font-bold leading-none">
                  {selectedTrainHistory.length}
                </span>
              </h3>

              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {selectedTrainHistory.length === 0 ? (
                  <div className="p-10 text-center bg-gray-50 border border-dashed border-gray-250 rounded-[4px] text-gray-450 flex flex-col items-center justify-center">
                    <Sparkles className="w-6 h-6 text-gray-305 mb-1" />
                    <span className="text-xs font-semibold text-gray-650">No registered repairs</span>
                    <p className="text-[10px] text-gray-400 mt-1">This trainset operates on standard telemetry runs.</p>
                  </div>
                ) : (
                  selectedTrainHistory.map(hist => (
                    <div key={hist.id} className="p-3.5 bg-gray-50 hover:bg-neutral-50 border border-gray-150 rounded-[4px] text-xs text-gray-700 flex flex-col justify-between transition-colors shadow-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-950 truncate block max-w-[140px] font-sans">{hist.type}</span>
                          <span className={`text-[8px] font-mono tracking-wide uppercase px-1 rounded-[4.1px] ${
                            hist.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-kcic-red border border-red-250'
                          }`}>
                            {hist.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-450 font-mono">Location: {hist.station_name}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-150/40 mt-2.5 pt-2 text-[9px] font-mono text-gray-400 leading-none">
                        <span>Sched: {new Date(hist.scheduled_at).toLocaleDateString()}</span>
                        {hist.completed_at && (
                          <span className="text-emerald-650 font-bold uppercase">Done</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <Train className="w-12 h-12 text-gray-300 mb-2" />
            <span className="font-bold text-sm">No Train Selected</span>
            <p className="text-xs mt-1">Select a trainset on the left roster to pull its operational histories.</p>
          </div>
        )}
      </div>

    </div>
  );
}
