export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export type UserRole =
  | "Admissions"
  | "Directorate"
  | "Finance"
  | "HR"
  | "Finance Staff"
  | "staff"
  | "Student"
  | "readonly";

export const CAN_VIEW_INTAKES: UserRole[] = [
  "Admissions",
  "Directorate",
  "Finance",
  "Finance Staff",
];

export const CAN_VIEW_MAJORS: UserRole[] = ["Admissions", "Directorate"];

export type Department =
  | "HR"
  | "ENGINEERING"
  | "ADMISSIONS"
  | "FINANCE"
  | "EXAM"
  | "OPERATION"
  | "DIRECTORATE";
export type AlertType =
  | "FOLLOW_UP"
  | "ENROLLMENT"
  | "DROPOUT"
  | "DOCUMENT"
  | "OTHER";
export type StudentStatus =
  | "Enrolled"
  | "Dropout"
  | "Graduated"
  | "Interrupted";
// export type EducationLevel = "Primary" | "Secondary" | "Tertiary" | "Other";
export type Gender = "Male" | "Female" | "Other";
export type PromotionStatus = "Promoted" | "Retained" | "Not Applicable";

export interface Major {
  id: string;
  code: string;
  name: string;
  description: string;
  years: Year[];
}

export interface Semester {
  id: string | null;
  semesterNumber: number;
  name: string;
}
export type Year =
  | {
      id: string | null;
      type: "FOUNDATION";
      name: string;
      yearNumber: null;
      semesters: Semester[];
    }
  | {
      id: string | null;
      type: "NORMAL";
      name: string;
      yearNumber: number;
      semesters: Semester[];
    };

export interface IntakeSemester {
  id: string;
  semester_id: string;
  start_date: string;
  end_date: string;
}

export type ScheduleState = Record<string, IntakeSemester>;

export interface Intake {
  id: string;
  code: string;
  majorId: string;
  majorName: string;
  currentSemId: string;
  year: number;
  currentStatus: string;
  capacity: number;
  startDate: string;
  endDate: string | null;
  semester_schedules?: IntakeSemester[];
}
interface Dropout {
  intakeCode?: string;
  enrolledDate?: string;
  dropoutDate?: string;
  reason?: string;
  remark?: string;
  status?: string;
}

interface PreviousEnrollments {
  enrolledDate: string;
  intakeCode: string;
  status: string;
  dropout: Dropout;
}
export interface FilterState {
  selectedYear?: number;
  selectedYearMajor?: string;
  selectedIntake?: string;
}

export interface Student {
  id: string; // No
  street?: string;
  city?: string;
  region?: string;
  studentId?: string;
  fullName: string; // Name
  educationLevel: string; // Edu lvl
  gender: Gender | string; // Gender
  nrc: string; // NRC
  birthDate: string; // Birth Date (YYYY-MM-DD)
  studentPhoneNo: string; // Student Ph No.
  parentName: string; // Parent Name
  parentPhoneNo: string; // Parent Ph No.
  email: string; // Email
  scholar: boolean; // Scholar (Y/N)
  firstInstallmentFee: boolean;
  registrationFee: boolean;
  enrolledDate: string; // Enrolled Date (YYYY-MM-DD)
  remark?: string; // Remark
  referralName?: string; // Referal Name
  dropout?: Dropout;
  previousEnrollments?: PreviousEnrollments[];
  nrcCopy: boolean; // NRC copy (document received)
  censusCopy: boolean; // Census copy (document received)
  passportPhoto: boolean; // Passport Photo (document received)
  educationCertificate: boolean; // Education Certificate (document received)

  // Legacy fields for compatibility
  currentStatus?: string;
  majorId?: string;
  majorName?: string;
  intakeId: string;
  intakeCode?: string | "";
  status: StudentStatus;
  dropoutDate?: string;
  dropoutReason?: string;
}

export type EnquiryType = "Enquiry" | "Walk-in" | "Phone" | "Facebook";
export type SourceOfInformation =
  | "Friend"
  | "Facebook"
  | "Pamphlet"
  | "Newspaper"
  | "Others";

export interface FollowUpSession {
  id: string;
  enquiryId: string;
  date: string; // YYYY-MM-DD
  handledBy: string; // Staff member name
  walkupFollowup: boolean; // Whether it was a walk-up follow-up
  remark: string;
}

export interface Enquiry {
  id: string;
  date: string; // YYYY-MM-DD
  desiredProgram: string; // Program/Major interested in
  studentName: string;
  educationLevel: string;
  studentContactNo: string;
  parentName: string;
  parentContactNo: string;
  address: string;
  enquiryType: EnquiryType; // Enquiry, Walk-in, Phone, Facebook
  sourceOfInformation: SourceOfInformation; // How they heard about STI Myanmar University
  followUpSessions: FollowUpSession[]; // History of follow-ups
  remark?: string;
}

// export interface User {
//   id?: string;
//   is_superuser?: boolean;
//   username: string;
//   password?: string; // In real app, this would be hashed; not returned from backend
//   role: "admin" | "staff";
//   fullName: string;
//   email: string;
// }

export interface User {
  id?: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  isSuperuser?: boolean;
  password?: string; // In real app, this would be hashed; not returned from backend
}

export interface ReportEnquiryEntry {
  enquiryId: string;
  studentName: string;
  action: string; // e.g., "Follow-up conducted", "Initial contact", etc.
}

export interface DailyReport {
  id: string;
  userId?: string;
  userName: string;
  date: string; // YYYY-MM-DD
  activities: string; // Text description of what was done
  enquiriesHandled: ReportEnquiryEntry[];
  createdAt: string; // When report was submitted
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

export interface DropoutStudent {
  email: string;
  fullName: string;
  id: string;
  status: string;
  studentId: string;
  enrolledDate: string;
  studentPhone: string;
}

export interface Notification {
  id: string;
  userId?: string | null;
  studentId?: string | null;
  studentName?: string;
  title: string;
  message: string;
  alertType: AlertType;
  isRead: boolean;
  createdAt: string;
}
