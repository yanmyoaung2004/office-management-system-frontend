export interface FinanceIntake {
  id: string;
  code: string;
  majorName: string;
  year: number;
}

export interface FinanceEnrollment {
  studentId: string;
  studentName: string;
  studentPhone: string;
  isPaid: boolean;
  amount?: number;
}

export interface FinanceFeePayload {
  studentId: string;
  intakeId: string;
  amount?: number;
}
