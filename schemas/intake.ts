import { z } from "zod/v4";

export const intakeSchema = z.object({
  code: z.string().min(1, { message: "Intake code is required" }),
  majorId: z.string().min(1, { message: "Major is required" }),
  year: z.coerce.number().int().min(1, { message: "Year is required" }),
  currentSemId: z.string().min(1, { message: "Current semester is required" }),
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().optional(),
  semester_schedules: z.array(z.any()).optional(),
});

export type IntakeFormValues = z.infer<typeof intakeSchema>;
