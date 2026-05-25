import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(100, "Email too long"),
  role: z.enum(["Admin", "staff"]),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const userDefaultValues: UserFormValues = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  role: "staff",
};
