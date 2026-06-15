/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Station, TrainSet, MaintenanceOrder, MaintenanceItem, Technician, Alert, AuditLog } from './types';

export const INITIAL_STATIONS: Station[] = [
  {
    id: "st-hlm-011e-4cb8-9999",
    name: "Halim Station",
    code: "HLM",
    location: "Jakarta Timur, DKI Jakarta",
    created_at: "2023-10-01T00:00:00Z"
  },
  {
    id: "st-kwg-022e-4cb8-9999",
    name: "Karawang Station",
    code: "KWG",
    location: "Karawang, Jawa Barat",
    created_at: "2023-10-01T00:00:00Z"
  },
  {
    id: "st-pdl-033e-4cb8-9999",
    name: "Padalarang Station",
    code: "PDL",
    location: "Bandung Barat, Jawa Barat",
    created_at: "2023-10-01T00:00:00Z"
  },
  {
    id: "st-tgl-044e-4cb8-9999",
    name: "Tegalluar Station",
    code: "TGR",
    location: "Kabupaten Bandung, Jawa Barat",
    created_at: "2023-10-01T00:00:00Z"
  }
];

export const INITIAL_TRAIN_SETS: TrainSet[] = [
  { id: "tr-01", train_number: "KCIC-CR400AF-01", model: "CR400AF", status: "operational" },
  { id: "tr-02", train_number: "KCIC-CR400AF-02", model: "CR400AF", status: "operational" },
  { id: "tr-03", train_number: "KCIC-CR400AF-03", model: "CR400AF", status: "maintenance" },
  { id: "tr-04", train_number: "KCIC-CR400AF-04", model: "CR400AF", status: "operational" },
  { id: "tr-05", train_number: "KCIC-CR400AF-05", model: "CR400AF", status: "maintenance" },
  { id: "tr-06", train_number: "KCIC-CR400AF-06", model: "CR400AF", status: "operational" },
  { id: "tr-07", train_number: "KCIC-CR400AF-07", model: "CR400AF", status: "operational" },
  { id: "tr-08", train_number: "KCIC-CR400AF-08", model: "CR400AF", status: "decommissioned" }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  { id: "tech-01", user_id: "user-budi", name: "Budi Santoso", specialization: "Propulsion & Traction", station_id: "st-hlm-011e-4cb8-9999" },
  { id: "tech-02", user_id: "user-agus", name: "Agus Hermawan", specialization: "Pantograph & High Voltage", station_id: "st-tgl-044e-4cb8-9999" },
  { id: "tech-03", user_id: "user-siti", name: "Siti Rahma", specialization: "Braking & Pneumatics", station_id: "st-pdl-033e-4cb8-9999" },
  { id: "tech-04", user_id: "user-dian", name: "Dian Wijaya", specialization: "Signaling & TCMS", station_id: "st-hlm-011e-4cb8-9999" },
  { id: "tech-05", user_id: "user-eko", name: "Eko Prasetyo", specialization: "Mechanical & Bogies", station_id: "st-kwg-022e-4cb8-9999" }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "al-01",
    station_id: "st-hlm-011e-4cb8-9999",
    station_name: "Halim Station",
    train_set_id: "tr-03",
    train_number: "KCIC-CR400AF-03",
    severity: "critical",
    message: "Traction motor over-temperature fault in Car 4. Current temperature: 145°C limit (95°C max). Request immediate yard docking.",
    resolved_at: null,
    created_at: "2026-05-23T01:30:00Z"
  },
  {
    id: "al-02",
    station_id: "st-pdl-033e-4cb8-9999",
    station_name: "Padalarang Station",
    train_set_id: "tr-05",
    train_number: "KCIC-CR400AF-05",
    severity: "high",
    message: "Pantograph static pressure deviation. Measured pressure: 61N (Target range: 70N-85N). Scheduling urgent carbon strip wear alignment.",
    resolved_at: null,
    created_at: "2026-05-23T02:15:00Z"
  },
  {
    id: "al-03",
    station_id: "st-kwg-022e-4cb8-9999",
    station_name: "Karawang Station",
    train_set_id: "tr-01",
    train_number: "KCIC-CR400AF-01",
    severity: "warning",
    message: "TCMS logged warning: Communication heartbeat latency in auxiliary converter sensor line. Restored automatically of system.",
    resolved_at: "2026-05-23T03:00:00Z",
    created_at: "2026-05-23T02:45:00Z"
  },
  {
    id: "al-04",
    station_id: "st-tgl-044e-4cb8-9999",
    station_name: "Tegalluar Station",
    train_set_id: "tr-07",
    train_number: "KCIC-CR400AF-07",
    severity: "info",
    message: "Ounce cycle diagnostic routine run on Train Car 1 battery storage units. Internal resistance levels stable.",
    resolved_at: "2026-05-23T03:40:00Z",
    created_at: "2026-05-23T03:20:00Z"
  }
];

export const INITIAL_MAINTENANCE_ORDERS: MaintenanceOrder[] = [
  {
    id: "order-100",
    train_set_id: "tr-03",
    train_number: "KCIC-CR400AF-03",
    station_id: "st-hlm-011e-4cb8-9999",
    station_name: "Halim Station",
    type: "Bogie Traction Overhaul",
    priority: "critical",
    status: "in_progress",
    scheduled_at: "2026-05-23T01:45:00Z",
    completed_at: null,
    created_by: "dispatcher@kcic.co.id"
  },
  {
    id: "order-101",
    train_set_id: "tr-05",
    train_number: "KCIC-CR400AF-05",
    station_id: "st-pd-033e-4cb8-9999",
    station_name: "Padalarang Station",
    type: "Pantograph Carbon Strip Alignment",
    priority: "high",
    status: "pending",
    scheduled_at: "2026-05-23T04:00:00Z",
    completed_at: null,
    created_by: "dispatcher@kcic.co.id"
  },
  {
    id: "order-102",
    train_set_id: "tr-02",
    train_number: "KCIC-CR400AF-02",
    station_id: "st-tgl-044e-4cb8-9999",
    station_name: "Tegalluar Station",
    type: "Brake Pad Core Swap-out",
    priority: "medium",
    status: "completed",
    scheduled_at: "2026-05-22T08:00:00Z",
    completed_at: "2026-05-22T11:30:00Z",
    created_by: "maint-supervisor@kcic.co.id"
  },
  {
    id: "order-103",
    train_set_id: "tr-04",
    train_number: "KCIC-CR400AF-04",
    station_id: "st-hlm-011e-4cb8-9999",
    station_name: "Halim Station",
    type: "Cabin Air Filter Replacement",
    priority: "low",
    status: "completed",
    scheduled_at: "2026-05-22T13:00:00Z",
    completed_at: "2026-05-22T14:45:00Z",
    created_by: "maint-supervisor@kcic.co.id"
  },
  {
    id: "order-104",
    train_set_id: "tr-06",
    train_number: "KCIC-CR400AF-06",
    station_id: "st-kwg-022e-4cb8-9999",
    station_name: "Karawang Station",
    type: "TCMS Sensor Calibration",
    priority: "medium",
    status: "pending",
    scheduled_at: "2026-05-23T06:00:00Z",
    completed_at: null,
    created_by: "dispatcher@kcic.co.id"
  }
];

export const INITIAL_MAINTENANCE_ITEMS: MaintenanceItem[] = [
  {
    id: "item-100-1",
    order_id: "order-100",
    component: "Traction Motor Bearing",
    description: "Inspect damage to bearing sleeves on Car 4. Overheated conditions caused minor localized thermal sealing wear.",
    action_taken: "Sleeve disassembled, thermal sensor line inspected, oil feed line flushed.",
    technician_id: "tech-01",
    technician_name: "Budi Santoso"
  },
  {
    id: "item-100-2",
    order_id: "order-100",
    component: "Temperature Transducer",
    description: "Verify sensory accuracy of temperature readings vs mechanical physical checks on stator cores.",
    action_taken: "Transducer core recalibrated. Restored offset within 0.5°C threshold.",
    technician_id: "tech-04",
    technician_name: "Dian Wijaya"
  },
  {
    id: "item-102-1",
    order_id: "order-102",
    component: "Car 2 Braking Caliper Disc",
    description: "Brake pad depletion level exceeded 85% on current high-speed operations log.",
    action_taken: "Replacing standard copper-alloy brake pads and adjusting mechanical caliper limits back to 1.2mm travel standard.",
    technician_id: "tech-02",
    technician_name: "Agus Hermawan"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    user_id: "user-system",
    user_email: "system@kcic.co.id",
    action: "TELEMETRY_ALERT_DETECTED",
    entity_type: "alerts",
    entity_id: "al-01",
    payload: { details: "Traction motor temp reached 145C. Triggered automatic critical alert alarm." },
    created_at: "2026-05-23T01:30:00Z"
  },
  {
    id: "log-2",
    user_id: "user-budi",
    user_email: "budi.santoso@kcic.co.id",
    action: "ORDER_STATUS_TRANSITION",
    entity_type: "maintenance_orders",
    entity_id: "order-100",
    payload: { from: "pending", to: "in_progress", notes: "Assigned parts sorted, beginning bearing sleeve tear down." },
    created_at: "2026-05-23T02:00:00Z"
  }
];
