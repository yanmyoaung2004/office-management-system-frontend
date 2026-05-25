import type { Subject } from "./major";

export interface IntakeSemester {
  id: string;
  semester_id: string;
  semester_name?: string;
  subjects: Subject[];
  start_date: string;
  year?: string;
  end_date: string;
}

export interface Intake {
  id: string;
  code: string;
  majorId: string;
  majorName: string;
  currentSemId: string;
  year: number;
  currentStatus: string;
  capacity: number;
  createdAt?: string;
  startDate: string;
  endDate: string | null;
  semester_schedules?: IntakeSemester[];
}

export interface IntakeFormData {
  code: string;
  year: number;
  majorId: string;
  capacity: number;
  startDate: string;
  endDate?: string;
  semester_schedules: IntakeSemester[];
}

export interface IntakeListResponse {
  success: boolean;
  data: Intake[];
}

export interface ScheduleDateEntry {
  start_date: string;
  end_date: string;
}

export type ScheduleState = Record<string, IntakeSemester>;
