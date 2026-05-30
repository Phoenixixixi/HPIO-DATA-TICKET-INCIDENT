/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Station {
  id: string; // UUID
  name: string;
  code: string; // e.g., HLM, KWG, PDL, TGL
  location: string;
  created_at: string;
}

export type TrainStatus = 'operational' | 'maintenance' | 'decommissioned';

export interface TrainSet {
  id: string; // UUID
  train_number: string; // e.g., KCIC-400AF-01
  model: string; // CR400AF
  status: TrainStatus;
}

export type OrderPriority = 'critical' | 'high' | 'medium' | 'low';
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceOrder {
  id: string; // UUID
  train_set_id: string;
  train_number?: string; // resolved
  station_id: string;
  station_name?: string; // resolved
  type: string; // e.g., Bogie overhaul, pantograph inspection, brake system calibration
  priority: OrderPriority;
  status: OrderStatus;
  scheduled_at: string;
  completed_at: string | null;
  created_by: string; // user email/ID
}

export interface MaintenanceItem {
  id: string; // UUID
  order_id: string;
  component: string; // e.g., Traction Motor, Current Collector, Brake Pad
  description: string;
  action_taken: string;
  technician_id: string;
  technician_name?: string; // resolved
}

export interface Technician {
  id: string; // UUID
  user_id: string; // Supabase dynamic auth user_id
  name: string;
  specialization: string; // e.g., Electrical, Mechanical, Signaling
  station_id: string;
}

export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info';

export interface Alert {
  id: string; // UUID
  station_id: string;
  station_name?: string;
  station_code?: string;
  train_set_id: string;
  train_number?: string;
  severity: AlertSeverity;
  message: string;
  resolved_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface BlueprintFile {
  title: string;
  filename: string;
  language: string;
  code: string;
}

export interface BlueprintCategory {
  id: string;
  name: string;
  description: string;
  files: BlueprintFile[];
}

export interface Incident {
  id: string;
  timestamp: string; // created_at
  nomor_tiket: string; // e.g. HPIO-INC-040126-082
  tanggal_lapor: string;
  nama_pelapor: string;
  nama_penerima_laporan: string;
  stasiun: string; // e.g. HALIM, KARAWANG, TEGALLUAR SUMMARECON, PADALARANG, 501
  kategori_aset: string; // TVM, Gate, PIDS, PDP, Xray, Speaker
  deskripsi_masalah: string;
  prioritas: 'P1 (URGENT)' | 'P2 (CRITICAL)' | 'P3 (SERIOUS)';
  status: 'Open' | 'Closed' | 'On Escalation';
  nama_teknisi: string;
  waktu_melapor: string; // datetime
  waktu_respon: string; // datetime
  waktu_selesai: string | null; // datetime | null
  response_time: string; // hh:mm
  solving_time: string; // hh:mm
  wr_doc_no: string | null;
  status_eskalasi: string | null; // e.g. 'Sent'
  bulan: string; // e.g. 'Januari 2026'
  merged_doc_id: string;
  merged_doc_url: string;
}

export interface Link {
  active: boolean,
  label: string,
  page?: string | null,
  url?: string | null
}

interface DataIncident {
  bulan: string;
  deskripsi_masalah: string;
  equipment: string;

  idNumber: string;
  nomor_tiket: string;

  kategori_aset: string;
  stasiun_lokasi: string;

  nama_pelapor: string;
  nama_penerima_laporan: string;
  nama_teknisi: string;

  status_laporan: string;
  status_eskalasi: string;
  skala_prioritas: string;

  tanggal_lapor: string;
  timestamp: string;

  waktu_melapor: string;
  waktu_respon_teknisi: string;
  waktu_selesai: string;

  respon_time: string;
  solving_time: string;

  wr_doc_nomor: string | null;
}

export interface IncidentLog {
  current_page: number,
  data: DataIncident[],
  first_page_url: string,
  from: number,
  last_page: number,
  last_page_url: string,
  links: Link[],
  next_page_url: string,
  path: string,
  per_page: number,
  prev_page_url?: string | null,
  to: number,
  total: number
}
