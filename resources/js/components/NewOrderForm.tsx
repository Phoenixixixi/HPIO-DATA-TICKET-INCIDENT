/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  Calendar, 
  Wrench, 
  Train, 
  MapPin, 
  Send, 
  AlertCircle,
  Clock,
  UserCheck,
  X
} from 'lucide-react';
import { Station, TrainSet } from '../types';

interface NewOrderFormProps {
  stations: Station[];
  trains: TrainSet[];
  onAddOrder: (payload: {
    train_set_id: string;
    station_id: string;
    type: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    scheduled_at: string;
  }) => void;
  onClose: () => void;
}

export default function NewOrderForm({ stations, trains, onAddOrder, onClose }: NewOrderFormProps) {
  // Local form inputs state
  const [trainSetId, setTrainSetId] = useState('');
  const [stationId, setStationId] = useState('');
  const [taskType, setTaskType] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [scheduledAt, setScheduledAt] = useState('');
  
  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form submit handler with custom Zod-like specifications checks
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!trainSetId) newErrors.trainSetId = 'Active Trainset selector is required.';
    if (!stationId) newErrors.stationId = 'Target Station Depot location is required.';
    if (!taskType.trim()) {
      newErrors.taskType = 'Task Component type description cannot be blank.';
    } else if (taskType.trim().length < 5) {
      newErrors.taskType = 'Task description must list at least 5 characters.';
    }

    if (!scheduledAt) {
      newErrors.scheduledAt = 'Maintenance scheduling date and time is mandatory.';
    } else {
      const selectedDate = new Date(scheduledAt);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.scheduledAt = 'Scheduled date must be set in the future.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Pass valid payload up to orchestrator
    onAddOrder({
      train_set_id: trainSetId,
      station_id: stationId,
      type: taskType,
      priority,
      scheduled_at: new Date(scheduledAt).toISOString(),
    });

    onClose();
  };

  const commonTaskTemplates = [
    "Overhead Catenary Pantograph Strip Calibration",
    "Auxiliary Converter Module Thermal Sensor Swap",
    "Bogie Trailing Axle Wheelset Ultrasonic Flaw Inspection",
    "Braking Core Pneumatic Pressure Adjustments",
    "Passenger Cabin Air Filter Core Replacement",
    "TCMS Fault Log Verification Routing"
  ];

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      
      <div className="bg-white rounded-[4px] border border-gray-200 w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
        
        {/* Modal Header banner */}
        <div className="px-6 py-4 bg-[#1A1C1E] text-white flex justify-between items-center border-b border-white/10 select-none">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#C8102E] rounded-[3px] flex items-center justify-center font-bold italic text-sm text-white shrink-0">
              K
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-white uppercase">Dispatch Maintenance Work Ticket</span>
              <span className="text-[9px] text-white/50 font-mono tracking-widest mt-0.5">KCIC REAL-TIME GRID GATEWAY</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh] text-xs text-gray-700">
          
          {/* Quick Tasks Pre-Seeding */}
          <div className="p-4 bg-red-50/20 border border-[#C8102E]/10 rounded-[4px] space-y-2.5">
            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block leading-none">QUICK DIAGNOSTIC TEMPLATES</span>
            <div className="flex flex-wrap gap-1.5">
              {commonTaskTemplates.slice(0, 3).map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTaskType(tpl)}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-gray-150 rounded-[4px] text-[10px] transition-colors font-semibold text-gray-700 shadow-xs"
                >
                  {tpl.length > 32 ? tpl.slice(0, 32) + '...' : tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Form Rows */}
          <div className="grid grid-cols-2 gap-4">
            {/* Train Set Selection */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1 leading-none select-none">
                <Train className="w-3.5 h-3.5 text-gray-400" />
                <span>Target Trainset *</span>
              </label>
              <select
                value={trainSetId}
                onChange={(e) => {
                  setTrainSetId(e.target.value);
                  setErrors(prev => ({ ...prev, trainSetId: '' }));
                }}
                className={`w-full p-2.5 rounded-[4px] border ${
                  errors.trainSetId ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                } bg-white text-gray-950 font-sans outline-none transition-all`}
              >
                <option value="">-- Choose active CR400AF train --</option>
                {trains.filter(t => t.status !== 'decommissioned').map(t => (
                  <option key={t.id} value={t.id}>{t.train_number} ({t.status.toUpperCase()})</option>
                ))}
              </select>
              {errors.trainSetId && (
                <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.trainSetId}
                </span>
              )}
            </div>

            {/* Station Selection */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1 leading-none select-none">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>Station Destination Depot *</span>
              </label>
              <select
                value={stationId}
                onChange={(e) => {
                  setStationId(e.target.value);
                  setErrors(prev => ({ ...prev, stationId: '' }));
                }}
                className={`w-full p-2.5 rounded-[4px] border ${
                  errors.stationId ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                } bg-white text-gray-950 font-sans outline-none transition-all`}
              >
                <option value="">-- Choose depot bay --</option>
                {stations.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                ))}
              </select>
              {errors.stationId && (
                <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.stationId}
                </span>
              )}
            </div>
          </div>

          {/* Task Type / Component */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1 leading-none select-none">
              <Wrench className="w-3.5 h-3.5 text-gray-400" />
              <span>Diagnostic Repair & Task Description *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Propulsion stator temperature calibration & converter casing inspect"
              value={taskType}
              onChange={(e) => {
                setTaskType(e.target.value);
                setErrors(prev => ({ ...prev, taskType: '' }));
              }}
              className={`w-full p-2.5 rounded-[4px] border ${
                errors.taskType ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
              } bg-white text-gray-950 font-sans outline-none transition-all`}
            />
            {errors.taskType && (
              <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5">
                <AlertCircle className="w-3 h-3" /> {errors.taskType}
              </span>
            )}
          </div>

          {/* Priority & Scheduled Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority Selection */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold leading-none select-none">Priority Ranking</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-[4px] border border-gray-205 bg-white text-gray-950 font-sans outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
              >
                <option value="critical">🔴 CRITICAL - Ground Safety Stop</option>
                <option value="high">🟠 HIGH - Daily service cycle</option>
                <option value="medium">🟡 MEDIUM - Scheduled repair</option>
                <option value="low">🔵 LOW - Modular audit Swap</option>
              </select>
            </div>

            {/* Scheduled At Datetime-local */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase font-bold flex items-center gap-1 leading-none select-none">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Scheduled Date & Time *</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => {
                  setScheduledAt(e.target.value);
                  setErrors(prev => ({ ...prev, scheduledAt: '' }));
                }}
                className={`w-full p-2.5 rounded-[4px] border ${
                  errors.scheduledAt ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                } bg-white text-gray-950 font-sans outline-none transition-all`}
              />
              {errors.scheduledAt && (
                <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.scheduledAt}
                </span>
              )}
            </div>
          </div>

          {/* Informative Security Disclaimer */}
          <div className="p-3.5 bg-neutral-50 rounded-[4px] border border-gray-150 text-[11px] text-gray-500 space-y-1 font-sans">
            <span className="font-bold text-gray-750 font-mono uppercase text-[9px] tracking-wider leading-none block">SECURITY AUDIT DATA TRAIL:</span>
            <p className="leading-normal">This ticket dispatches an authenticated transactional query. System telemetry metadata (User IP, Station Code, and timestamp logs) registers directly into the Supabase database engine audits.</p>
          </div>

          {/* Form Action Controls Footer */}
          <div className="flex justify-end gap-3 pt-5 border-t border-gray-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[4px] cursor-pointer transition-colors uppercase tracking-wider text-[10px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#b00d25] text-white font-bold rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>File Ticket</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
