/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Clock, 
  User2, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  ShieldAlert, 
  Calendar,
  X,
  PlusCircle,
  Users
} from 'lucide-react';
import { MaintenanceOrder, MaintenanceItem, Station, TrainSet, Technician } from '../types';

interface MaintenanceViewProps {
  orders: MaintenanceOrder[];
  items: MaintenanceItem[];
  stations: Station[];
  trains: TrainSet[];
  technicians: Technician[];
  onAddOrderClick: () => void;
  onUpdateStatus: (id: string, status: any) => void;
  onAddItem: (orderId: string, component: string, desc: string, actionDesc: string, techId: string) => void;
}

export default function MaintenanceView({
  orders,
  items,
  stations,
  trains,
  technicians,
  onAddOrderClick,
  onUpdateStatus,
  onAddItem
}: MaintenanceViewProps) {
  // Filters state
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected order details state (defaults to the first order)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);

  // New item modal within details state
  const [showItemForm, setShowItemForm] = useState(false);
  const [newComponent, setNewComponent] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newTechId, setNewTechId] = useState(technicians[0]?.id || '');

  // Filter and compute active logs
  const filteredOrders = orders.filter(order => {
    const sMatch = stationFilter === 'all' || order.station_id === stationFilter;
    const pMatch = priorityFilter === 'all' || order.priority === priorityFilter;
    const stMatch = statusFilter === 'all' || order.status === statusFilter;
    const qMatch = searchQuery === '' || 
      order.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (order.train_number && order.train_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return sMatch && pMatch && stMatch && qMatch;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const selectedOrderItems = items.filter(i => i.order_id === selectedOrderId);

  // Color functions helpers
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critical': return 'bg-red-100 text-[#C8102E] font-bold border border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 font-semibold border border-amber-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-blue-100 text-blue-850 border border-blue-250';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'in_progress': return 'bg-[#C8102E] text-white animate-pulse-slow';
      case 'cancelled': return 'bg-gray-150 text-gray-500 border border-gray-200';
      default: return 'bg-yellow-50 text-yellow-800 border border-yellow-250';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50 text-gray-800">
      
      {/* 1. LEFT COLUMN: ORDERS LIST TABLE WITH FILTERS */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        
        {/* Sticky Header Actions & Filter Area */}
        <div className="p-4 bg-white border-b border-gray-200 shrink-0 space-y-3 font-sans">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 m-0 leading-none">Work Tickets Register</h2>
              <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider select-none">Unified depot inventory monitor</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input
              type="text"
              placeholder="Search train, components or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-200 rounded-[4px] text-xs focus:ring-1 focus:ring-kcic-red-500 focus:border-kcic-red-500 outline-none w-full bg-gray-50 text-gray-800"
            />

            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="p-2 border border-gray-200 rounded-[4px] text-xs outline-none bg-white font-sans text-gray-800 cursor-pointer"
            >
              <option value="all">depot: All depots</option>
              {stations.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-2 border border-gray-200 rounded-[4px] text-xs outline-none bg-white font-sans text-gray-800 cursor-pointer"
            >
              <option value="all">severity: All severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟡 Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-200 rounded-[4px] text-xs outline-none bg-white font-sans text-gray-800 cursor-pointer"
            >
              <option value="all">status: All statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">⚙️ In Progress</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>

        {/* Scrollable Grid Table */}
        <div className="flex-1 overflow-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center bg-white">
              <Wrench className="w-12 h-12 text-gray-300 mb-2" />
              <h3 className="text-sm font-bold text-gray-700">No matching orders found</h3>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Adjust your filters above or check the global depot inventory.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse bg-white font-sans">
              <thead className="bg-[#F4F5F7] sticky top-0 backdrop-blur-sm shadow-[0_1px_0_0_rgba(229,231,235,1)] z-10">
                <tr className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="p-3 pl-4">Train ID</th>
                  <th className="p-3">Component / Task</th>
                  <th className="p-3">Depot Location</th>
                  <th className="p-3">Scheduled At</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filteredOrders.map((order, index) => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`cursor-pointer transition-colors text-xs ${
                        isSelected 
                          ? 'bg-red-50/40 hover:bg-red-50/70 border-l-2 border-l-[#C8102E]' 
                          : index % 2 === 0 
                          ? 'bg-white hover:bg-gray-50/50' 
                          : 'bg-gray-50/20 hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="p-3 pl-4 font-mono font-bold text-gray-950">
                        {order.train_number}
                      </td>
                      <td className="p-3 text-gray-900 font-semibold max-w-[180px] break-words">
                        {order.type}
                      </td>
                      <td className="p-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-450" />
                          <span>{order.station_name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-gray-550 text-[11px]">
                        {new Date(order.scheduled_at).toLocaleDateString()} at {new Date(order.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-[4px] ${getPriorityBadge(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-[4px] ${getStatusBadge(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 2. RIGHT COLUMN: DETAILS DRAW PANELS / TIMELINE */}
      <div className="w-96 bg-white flex flex-col shrink-0 overflow-y-auto border-l border-gray-100 font-sans p-5 space-y-5">
        
        {selectedOrder ? (
          <>
            {/* Header Title with Status */}
            <div className="border-b border-gray-100 pb-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">WORK TICKET DETAILS</span>
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900">{selectedOrder.type}</h2>
              <div className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                TICKET_ID: <span className="text-gray-900 font-bold">{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Quick Informational Stats */}
            <div className="grid grid-cols-2 gap-3.5 pt-1.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-450 font-mono uppercase font-semibold">Active Trainset</span>
                <div className="font-bold flex items-center gap-1.5 text-gray-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {selectedOrder.train_number}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-450 font-mono uppercase font-semibold">Depot Destination</span>
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{selectedOrder.station_name}</span>
                </div>
              </div>
            </div>

            {/* Timings */}
            <div className="p-3 bg-gray-50 border border-gray-100/80 rounded space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-450" />
                  <span>Scheduled At:</span>
                </div>
                <span className="font-mono text-gray-900 font-medium">
                  {new Date(selectedOrder.scheduled_at).toLocaleDateString()} {new Date(selectedOrder.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-450" />
                  <span>Completed At:</span>
                </div>
                <span className="font-mono text-gray-900">
                  {selectedOrder.completed_at 
                    ? new Date(selectedOrder.completed_at).toLocaleTimeString() 
                    : <span className="text-gray-400 italic font-sans text-[11px]">N/A</span>
                  }
                </span>
              </div>
            </div>

            {/* 3-Step Interactive Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-450">Progress Timeline Checkpoints</h3>
              <div className="relative pl-6 space-y-4">
                
                {/* Vertical Line Connector */}
                <div className="absolute left-2.5 top-1.5 bottom-1.5 w-[1.5px] bg-gray-200"></div>

                {/* STEP 1: PENDING */}
                <div className="relative flex gap-3 text-xs">
                  <span className={`absolute -left-5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedOrder.status !== 'pending' 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white border-[#C8102E]'
                  }`}>
                    {selectedOrder.status !== 'pending' && <span className="text-[8px] font-bold">✓</span>}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 block leading-tight">Order Registered & Placed</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block leading-none">
                      Logged by Dispatcher ({selectedOrder.created_by.split('@')[0]})
                    </span>
                  </div>
                </div>

                {/* STEP 2: IN_PROGRESS */}
                <div className="relative flex gap-3 text-xs">
                  <span className={`absolute -left-5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedOrder.status === 'completed' 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : selectedOrder.status === 'in_progress'
                      ? 'bg-white border-[#C8102E] text-[#C8102E]'
                      : 'bg-white border-gray-300'
                  }`}>
                    {selectedOrder.status === 'completed' && <span className="text-[8px] font-bold">✓</span>}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 block leading-tight">Active Yard Service / Reparations</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block leading-none">
                      {selectedOrder.status === 'in_progress' ? '⚡ Currently undergoing repair' : 'Waiting for bay clearance'}
                    </span>
                  </div>
                </div>

                {/* STEP 3: COMPLETED */}
                <div className="relative flex gap-3 text-xs">
                  <span className={`absolute -left-5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedOrder.status === 'completed' 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {selectedOrder.status === 'completed' && <span className="text-[8px] font-bold">✓</span>}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 block leading-tight">Cycle Verified & Approved</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block leading-none">
                      Telemetry checks green. Back to active operations.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Timeline Action Operations */}
            <div className="p-3 bg-red-50/40 border border-[#C8102E]/10 rounded flex flex-col gap-2.5">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Workflow Engine Controls</span>
              
              <div className="grid grid-cols-2 gap-2">
                {selectedOrder.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(selectedOrder.id, 'in_progress')}
                    className="col-span-2 py-1.5 bg-kcic-red hover:bg-[#b00d25] text-white text-[11px] font-bold rounded transition-colors uppercase tracking-wider font-mono cursor-pointer"
                  >
                    🚀 Trigger Active Service
                  </button>
                )}

                {selectedOrder.status === 'in_progress' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(selectedOrder.id, 'completed')}
                      className="py-1.5 bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded transition-colors uppercase tracking-wider font-mono cursor-pointer"
                    >
                      ✓ Complete Cycle
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(selectedOrder.id, 'cancelled')}
                      className="py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[11px] font-bold rounded transition-colors uppercase tracking-wider font-mono cursor-pointer"
                    >
                      ✕ Abort Task
                    </button>
                  </>
                )}

                {selectedOrder.status === 'completed' && (
                  <div className="col-span-2 text-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded flex items-center justify-center gap-1.5 font-semibold">
                    <span>✅ Cycle successfully sealed</span>
                  </div>
                )}

                {selectedOrder.status === 'cancelled' && (
                  <div className="col-span-2 text-center text-xs text-gray-600 bg-gray-50 border border-gray-200 p-2 rounded flex items-center justify-center gap-1.5 font-semibold">
                    <span>✕ Work Ticket Aborted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Maintenance checklist/items under the ticket */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-gray-450 flex items-center gap-1">
                  <span>Logged Checklist Logs</span>
                  <span className="bg-gray-100 text-gray-600 text-[9px] px-1 py-0.5 rounded font-mono font-bold">
                    {selectedOrderItems.length}
                  </span>
                </h4>

                {selectedOrder.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => setShowItemForm(true)}
                    className="text-[10px] text-kcic-red font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Log checklist</span>
                  </button>
                )}
              </div>

              {/* Checklist items stream */}
              <div className="space-y-3.5">
                {selectedOrderItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4 font-mono">No replacement, inspection or assembly logs recorded. Add a log item during active repair states.</p>
                ) : (
                  selectedOrderItems.map(item => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-100 text-xs text-gray-700 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 font-mono">{item.component}</span>
                        <span className="text-[9px] text-gray-400 font-mono italic">by {item.technician_name || 'Agus'}</span>
                      </div>
                      <p className="text-[11px] leading-tight text-gray-600">{item.description}</p>
                      <div className="bg-white p-1.5 border border-gray-100 text-[10px] text-[#C8102E] rounded leading-tight">
                        <strong className="font-bold font-mono text-[9px] uppercase mr-1">ACTION:</strong>
                        {item.action_taken}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <Wrench className="w-12 h-12 text-gray-300 mb-2" />
            <span className="font-bold text-sm">No ticket selected</span>
            <p className="text-xs mt-1">Select an order row on the left register to display detailed schematics.</p>
          </div>
        )}

        {/* Dynamic Add Maintenance Item Modal Inline details panel */}
        {showItemForm && selectedOrder && (
          <div className="border border-amber-200 bg-amber-50/50 p-4 rounded space-y-3 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-amber-200">
              <span className="font-bold text-gray-900 font-mono">NEW IN-BAY SERVICE CHECKLIST LOG</span>
              <button onClick={() => setShowItemForm(false)} className="text-gray-500 hover:text-gray-900 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newComponent || !newDesc || !newAction) return;
              onAddItem(selectedOrder.id, newComponent, newDesc, newAction, newTechId);
              setNewComponent('');
              setNewDesc('');
              setNewAction('');
              setShowItemForm(false);
            }} className="space-y-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase font-semibold">Affected Component</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Current Collector Strip"
                  value={newComponent}
                  onChange={(e) => setNewComponent(e.target.value)}
                  className="p-1.5 border border-gray-200 bg-white rounded text-xs select-custom"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase font-semibold">Problem / Condition Detected</label>
                <textarea
                  required
                  placeholder="Describe wear alignment or physical tear log..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="p-1.5 border border-gray-200 bg-white rounded text-xs"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase font-semibold">Actions Implemented</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swapped-out modular brush assemblies, calibrated margins."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="p-1.5 border border-gray-200 bg-white rounded text-xs"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase font-semibold">Assigned Technician</label>
                <select
                  value={newTechId}
                  onChange={(e) => setNewTechId(e.target.value)}
                  className="p-1.5 border border-gray-200 bg-white rounded text-xs"
                >
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name} ({tech.specialization})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-[#C8102E] hover:bg-red-750 text-white font-bold rounded cursor-pointer transition-colors text-xs font-mono uppercase"
              >
                Seal Checklist Log
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
