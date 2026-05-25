import type { Gender, EnquiryType, SourceOfInformation, StudentStatus } from "./common";

export interface Dropout {
  intakeCode?: string;
  enrolledDate?: string;
  dropoutDate?: string;
  reason?: string;
  remark?: string;
  status?: string;
}

export interface PreviousEnrollments {
  enrolledDate: string;
  intakeCode: string;
  status: string;
  dropout: Dropout;
}

export interface Student {
  id: string;
  street?: string;
  city?: string;
  region?: string;
  studentSchoolId?: string;
  fullName: string;
  educationLevel: string;
  gender: Gender | string;
  nrc: string;
  birthDate: string;
  studentPhoneNo: string;
  parentName: string;
  parentPhoneNo: string;
  email: string;
  scholar: boolean;
  firstInstallmentFee: boolean;
  registrationFee: boolean;
  enrolledDate: string;
  remark?: string;
  referralName?: string;
  dropout?: Dropout;
  previousEnrollments?: PreviousEnrollments[];
  nrcCopy: boolean;
  censusCopy: boolean;
  passportPhoto: boolean;
  educationCertificate: boolean;

  currentStatus?: string;
  majorId?: string;
  majorName?: string;
  intakeId: string;
  intakeCode?: string | "";
  status: StudentStatus;
  dropoutDate?: string;
  dropoutReason?: string;
}

export interface StudentFormData {
  fullName: string;
  gender: string;
  nrcState: string;
  nrcTownship: string;
  nrcSerial: string;
  birthDate: string;
  street: string;
  region: string;
  city: string;
  studentPhoneNo: string;
  email: string;
  educationLevel: string;
  intakeId: string;
  parentName: string;
  parentPhoneNo: string;
  scholar: boolean;
  registrationFee: boolean;
  firstInstallmentFee: boolean;
  referralName: string;
  nrcCopy: boolean;
  censusCopy: boolean;
  passportPhoto: boolean;
  educationCertificate: boolean;
  remark: string;
  enrolledDate: string;
}

export interface DropoutFormData {
  reason: string;
  remark?: string;
  followUpDate?: string;
}

export interface ReactivateFormData {
  intakeId: string;
  remark?: string;
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

export interface Enquiry {
  id: string;
  date: string;
  desiredProgram: string;
  studentName: string;
  educationLevel: string;
  studentContactNo: string;
  parentName: string;
  parentContactNo: string;
  address: string;
  enquiryType: EnquiryType;
  sourceOfInformation: SourceOfInformation;
  followUpSessions: FollowUpSession[];
  remark?: string;
}

export interface EnquiryFormData {
  date: string;
  enquiryType: string;
  studentName: string;
  studentContactNo: string;
  desiredProgram: string;
  educationLevel: string;
  parentName: string;
  parentContactNo: string;
  address: string;
  sourceOfInformation: string;
  remark: string;
}

export interface FollowUpSession {
  id: string;
  enquiryId: string;
  date: string;
  handledBy: string;
  walkupFollowup: boolean;
  remark: string;
}

export interface FollowUpFormData {
  date: string;
  handledBy: string;
  walkupFollowup: boolean;
  remark: string;
}
