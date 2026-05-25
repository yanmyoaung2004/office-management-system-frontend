import { z } from "zod";

export const enquirySchema = z.object({
  date: z.string().min(1, "Date is required"),
  enquiryType: z.enum(["Enquiry", "Walk-in", "Phone", "Facebook"], {
    message: "Select enquiry type",
  }),
  studentName: z
    .string()
    .min(1, "Student name is required")
    .max(100, "Name too long"),
  studentContactNo: z.string().max(20, "Contact number too long").optional().or(z.literal("")),
  desiredProgram: z
    .string()
    .min(1, "Desired program is required")
    .max(100, "Program too long"),
  educationLevel: z.string().max(100).optional().or(z.literal("")),
  parentName: z.string().max(100).optional().or(z.literal("")),
  parentContactNo: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  sourceOfInformation: z.enum(
    ["Friend", "Facebook", "Pamphlet", "Newspaper", "Others"],
    { message: "Select source" },
  ),
  remark: z.string().max(1000).optional().or(z.literal("")),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;

export const enquiryDefaultValues: EnquiryFormValues = {
  date: new Date().toISOString().split("T")[0],
  enquiryType: "Enquiry",
  studentName: "",
  studentContactNo: "",
  desiredProgram: "",
  educationLevel: "",
  parentName: "",
  parentContactNo: "",
  address: "",
  sourceOfInformation: "Friend",
  remark: "",
};
