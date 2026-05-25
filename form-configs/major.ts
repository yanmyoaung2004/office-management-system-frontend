import type { FormConfig } from "@/types/forms";
import { majorSchema, majorDefaultValues, type MajorFormValues } from "@/schemas/major";

export const majorFormConfig: FormConfig<MajorFormValues> = {
  entityName: "Major",
  entityNamePlural: "Majors",
  schema: majorSchema,
  defaultValues: majorDefaultValues,
  createEndpoint: "/admission/majors",
  updateEndpoint: (id: string) => `/admission/majors/${id}`,
  successMessage: "Major saved successfully",
  errorMessage: "Failed to save major",
  sections: [
    {
      title: "Basic Information",
      columns: 2,
      fields: [
        {
          name: "name",
          label: "Name",
          type: "text",
          placeholder: "e.g. Bachelor of Science",
          required: true,
        },
        {
          name: "code",
          label: "Code",
          type: "text",
          placeholder: "e.g. BS-CS",
          required: true,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Describe the major",
          required: true,
          colSpan: 2,
        },
      ],
    },
    {
      title: "Duration",
      description: "Define years and semesters for this major",
      fields: [
        {
          name: "years",
          label: "Years & Semesters",
          type: "custom",
          render: () => null,
        },
      ],
    },
  ],
};
