import type { ExamType } from "./common";
import type { Intake } from "./intake";
import type { Semester } from "./major";

export interface ExamPaperComponent {
  id?: number;
  type: ExamType;
  exam_date: string;
  duration: string;
  marks_allocated: number;
  question_file?: string | null;
}

export interface ExamPaper {
  id?: number;
  subject: string;
  subject_name?: string;
  components: ExamPaperComponent[];
}

export interface ExamSchedule {
  id: string;
  title: string;
  intake: string;
  semester: string;
  semester_name: string;
  date_started: string;
  papers: ExamPaper[];
}

export interface Exam {
  id: string;
  title: string;
  dateStarted: string;
  intake: Intake;
  semester: Semester;
}

export interface ExamFormData {
  title: string;
  intake_id: string;
  semester_id: string;
  date_started: string;
  papers: ExamPaper[];
}

export interface ExamListResponse {
  success: boolean;
  data: ExamSchedule[];
}

export interface ExamPaperComponentFormData {
  type: ExamType;
  exam_date: string;
  duration: string;
  marks_allocated: number;
}

export interface SubjectFrequency {
  id: string;
  subject: string;
  subject_code: string;
  subject_name: string;
  frequency: number;
}

export interface SubjectFrequencyFormData {
  subject: string;
  frequency: number;
}

export interface TimetableSlot {
  day: number;
  day_label: string;
  slots: {
    slot: string;
    subject_code: string | null;
    subject_name: string | null;
    teacher_name: string | null;
  }[];
}

export interface Timetable {
  intake: string;
  semester: string;
  timetable: TimetableSlot[];
  warnings?: string[];
}

export interface ExamResultEntry {
  student_id: string;
  marks: number;
  remarks?: string;
}

export interface ExamResultFormData {
  component_id?: string;
  subject?: string;
  results: ExamResultEntry[];
}

export interface ShareLink {
  id: string;
  exam: string;
  component: string;
  token: string;
  expires_at: string;
}
