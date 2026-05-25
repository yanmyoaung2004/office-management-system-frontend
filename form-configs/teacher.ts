import type { FormConfig } from "@/types/forms";
import { teacherSchema, teacherDefaultValues, type TeacherFormValues } from "@/schemas/teacher";

export const teacherFormConfig: FormConfig<TeacherFormValues> = {
  entityName: "Teacher",
  entityNamePlural: "Teachers",
  schema: teacherSchema,
  defaultValues: teacherDefaultValues,
  createEndpoint: "/exam/teachers/",
  updateEndpoint: (id: string) => `/exam/teachers/${id}/`,
  detailRoute: (id: string) => `/exam/teachers/${id}`,
  successMessage: "Teacher saved successfully",
  errorMessage: "Failed to save teacher",
  sections: [
    {
      title: "Basic Information",
      fields: [
        {
          name: "name",
          label: "Name",
          type: "text",
          placeholder: "e.g. John Doe",
          required: true,
        },
        {
          name: "phone_number",
          label: "Phone",
          type: "tel",
          placeholder: "e.g. +260991234567",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "e.g. john@sti.edu",
        },
      ],
    },
    {
      title: "Subject Assignment",
      description: "Select the subjects this teacher can teach",
      fields: [
        {
          name: "subject_ids",
          label: "Subjects",
          type: "custom",
          render: () => null,
        },
      ],
    },
  ],
};
