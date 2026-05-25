import { z } from "zod";

export const teacherSchema = z.object({
  type: z.enum(["FULL_TIME", "PART_TIME"]),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number too long"),
  email: z
    .string()
    .max(100, "Email too long")
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  subject_ids: z.array(z.string()).default([]),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

export const teacherDefaultValues: TeacherFormValues = {
  type: "FULL_TIME",
  name: "",
  phone_number: "",
  email: "",
  subject_ids: [],
};
