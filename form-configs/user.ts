import type { FormConfig } from "@/types/forms";
import { userSchema, userDefaultValues, type UserFormValues } from "@/schemas/user";

export const userFormConfig: FormConfig<UserFormValues> = {
  entityName: "User",
  entityNamePlural: "Users",
  schema: userSchema,
  defaultValues: userDefaultValues,
  createEndpoint: "/users",
  updateEndpoint: (id: string) => `/users/${id}`,
  successMessage: "User saved successfully",
  errorMessage: "Failed to save user",
  sections: [
    {
      title: "Account Information",
      columns: 2,
      fields: [
        {
          name: "username",
          label: "Username",
          type: "text",
          placeholder: "e.g. jdoe",
          required: true,
        },
        {
          name: "password",
          label: "Password",
          type: "text",
          placeholder: "Enter password",
          required: true,
        },
      ],
    },
    {
      title: "Personal Information",
      columns: 2,
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "e.g. John Doe",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "e.g. john@sti.edu",
          required: true,
        },
      ],
    },
    {
      title: "Role",
      fields: [
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          options: [
            { value: "staff", label: "Staff" },
            { value: "Admin", label: "Admin" },
          ],
        },
      ],
    },
  ],
};
