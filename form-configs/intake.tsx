import type { FormConfig } from "@/types/forms";
import type { Major } from "@/types";
import { intakeSchema, type IntakeFormValues } from "@/schemas/intake";
import { IntakeScheduleField } from "@/components/intake/intake-schedule-field";
import { IntakeSemesterField } from "@/components/intake/intake-semester-field";

export function createIntakeFormConfig(
  majors: Major[],
): FormConfig<IntakeFormValues> {
  return {
    entityName: "Intake",
    entityNamePlural: "Intakes",
    schema: intakeSchema,
    defaultValues: {
      code: "",
      majorId: "",
      year: new Date().getFullYear(),
      currentSemId: "",
      capacity: 20,
      startDate: "",
      endDate: "",
      semester_schedules: [],
    },
    createEndpoint: "/admission/intakes",
    updateEndpoint: (id: string) => `/admission/intakes/${id}`,
    successMessage: "Intake saved successfully",
    errorMessage: "Failed to save intake",
    sections: [
      {
        title: "Basic Information",
        columns: 2,
        fields: [
          {
            name: "code",
            label: "Intake Code",
            type: "text",
            placeholder: "e.g., CS1, PH1",
            required: true,
          },
          {
            name: "year",
            label: "Year",
            type: "number",
            required: true,
          },
          {
            name: "majorId",
            label: "Major",
            type: "select",
            required: true,
            options: majors.map((m) => ({
              value: m.id,
              label: m.name,
            })),
            placeholder: "Select a major",
          },
          {
            name: "currentSemId",
            label: "Current Semester",
            type: "custom",
            render: (form) => (
              <IntakeSemesterField form={form} majors={majors} />
            ),
          },
          {
            name: "capacity",
            label: "Capacity",
            type: "number",
            required: true,
          },
          {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true,
          },
        ],
      },
      {
        title: "Schedule Configuration",
        description: "Set start and end dates for each semester",
        fields: [
          {
            name: "semester_schedules",
            label: "",
            type: "custom",
            colSpan: 2,
            render: (form) => {
              const majorId = form.watch("majorId") ?? "";
              return (
                <IntakeScheduleField
                  key={majorId}
                  form={form}
                  majors={majors}
                  majorId={majorId}
                />
              );
            },
          },
        ],
      },
    ],
  };
}
