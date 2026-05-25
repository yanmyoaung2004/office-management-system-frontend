export type UserRole =
  | "Admissions"
  | "Directorate"
  | "Finance"
  | "HR"
  | "Finance Staff"
  | "Exam Staff"
  | "staff"
  | "Student"
  | "readonly";

export type Department =
  | "HR"
  | "ENGINEERING"
  | "ADMISSIONS"
  | "FINANCE"
  | "EXAM"
  | "OPERATION"
  | "DIRECTORATE";

export type StudentStatus = "Enrolled" | "Dropout" | "Graduated" | "Interrupted";
export type Gender = "Male" | "Female" | "Other";
export type PromotionStatus = "Promoted" | "Retained" | "Not Applicable";
export type AlertType = "FOLLOW_UP" | "ENROLLMENT" | "DROPOUT" | "DOCUMENT" | "OTHER";
export type EnquiryType = "Enquiry" | "Walk-in" | "Phone" | "Facebook";
export type SourceOfInformation =
  | "Friend" | "Facebook" | "Pamphlet" | "Newspaper" | "Others";
export type ExamType = "PRESENTATION" | "ONPAPER" | "ASSIGNMENT";

export const CAN_VIEW_INTAKES: UserRole[] = [
  "Admissions", "Directorate", "Finance", "Finance Staff",
];

export const CAN_VIEW_MAJORS: UserRole[] = ["Admissions", "Directorate"];

export interface FilterState {
  selectedYear?: number;
  selectedYearMajor?: string;
  selectedIntake?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalEnrolled: number;
  totalDropouts: number;
  totalGraduated: number;
  studentsByMajor: Record<string, number>;
  dropoutsByMajor: Record<string, number>;
  studentsBySemester: Record<number, number>;
  studentsByEducationLevel: Record<string, number>;
  studentsByGender: Record<string, number>;
  documentCompletionRate: number;
}

export interface ReportEnquiryEntry {
  enquiryId: string;
  studentName: string;
  action: string;
}

export interface DailyReport {
  id: string;
  userId?: string;
  userName: string;
  date: string;
  activities: string;
  enquiriesHandled: ReportEnquiryEntry[];
  createdAt: string;
}
