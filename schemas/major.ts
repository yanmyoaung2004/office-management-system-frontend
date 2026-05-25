import { z } from "zod";

export const majorSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code too long"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
  years: z.array(z.any()).default([]),
});

export type MajorFormValues = z.infer<typeof majorSchema>;

export const majorDefaultValues: MajorFormValues = {
  code: "",
  name: "",
  description: "",
  years: [],
};
