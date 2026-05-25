import { z } from "zod/v4";

export const enrollmentSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  nrcState: z.string().min(1, { message: "NRC state is required" }),
  nrcTownship: z.string().min(1, { message: "NRC township is required" }),
  nrcSerial: z.string().min(6, { message: "NRC serial must be 6 digits" }).max(6),
  birthDate: z.string().min(1, { message: "Birth date is required" }),
  street: z.string().min(1, { message: "Street is required" }),
  region: z.string().min(1, { message: "Region is required" }),
  city: z.string().min(1, { message: "City is required" }),
  studentPhoneNo: z.string().min(1, { message: "Phone number is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  educationLevel: z.string().min(1, { message: "Education level is required" }),
  intakeId: z.string().min(1, { message: "Intake is required" }),
  parentName: z.string().min(1, { message: "Parent name is required" }),
  parentPhoneNo: z.string().min(1, { message: "Parent phone is required" }),
  scholar: z.boolean(),
  registrationFee: z.boolean(),
  firstInstallmentFee: z.boolean(),
  referralName: z.string().optional(),
  nrcCopy: z.boolean(),
  censusCopy: z.boolean(),
  passportPhoto: z.boolean(),
  educationCertificate: z.boolean(),
  remark: z.string().optional(),
  enrolledDate: z.string().min(1),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;
