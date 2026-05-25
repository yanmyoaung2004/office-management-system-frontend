export interface SubjectDisplay {
  id: string;
  code: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  subject_ids: string[];
  subjects_display: SubjectDisplay[];
  created_at: string;
  updated_at: string;
}

export interface TeacherAvailability {
  id: string;
  teacher: string;
  day_of_week: number;
  slot: "9-11" | "12-2" | "2-4";
  is_available: boolean;
}

export interface TeacherFormData {
  name: string;
  phone_number: string;
  email: string;
  subject_ids: string[];
}

export interface AvailabilityFormData {
  availabilities: TeacherAvailability[];
}

export interface TeacherListResponse {
  success: boolean;
  data: Teacher[];
}

export interface TeacherDetailResponse {
  success: boolean;
  data: Teacher;
}

export interface TeacherAvailabilityResponse {
  success: boolean;
  data: TeacherAvailability[];
}
