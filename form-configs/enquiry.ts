import type { FormConfig } from "@/types/forms";
import { enquirySchema, enquiryDefaultValues, type EnquiryFormValues } from "@/schemas/enquiry";

export const enquiryFormConfig: FormConfig<EnquiryFormValues> = {
  entityName: "Enquiry",
  entityNamePlural: "Enquiries",
  schema: enquirySchema,
  defaultValues: enquiryDefaultValues,
  createEndpoint: "/admission/enquiries",
  successMessage: "Enquiry created successfully",
  errorMessage: "Failed to create enquiry",
  sections: [
    {
      title: "Date & Type",
      columns: 2,
      fields: [
        {
          name: "date",
          label: "Enquiry Date",
          type: "date",
          required: true,
        },
        {
          name: "enquiryType",
          label: "Enquiry Type",
          type: "select",
          required: true,
          options: [
            { value: "Enquiry", label: "Enquiry" },
            { value: "Walk-in", label: "Walk-in" },
            { value: "Phone", label: "Phone" },
            { value: "Facebook", label: "Facebook" },
          ],
        },
      ],
    },
    {
      title: "Student Information",
      columns: 2,
      fields: [
        {
          name: "studentName",
          label: "Student Name",
          type: "text",
          placeholder: "e.g. Jane Doe",
          required: true,
        },
        {
          name: "studentContactNo",
          label: "Student Phone No.",
          type: "tel",
          placeholder: "e.g. +260991234567",
        },
        { name: "desiredProgram", label: "Desired Program", type: "text", placeholder: "e.g. BSc Computer Science", required: true },
        { name: "educationLevel", label: "Education Level", type: "text", placeholder: "e.g. Grade 12" },
      ],
    },
    {
      title: "Parent / Guardian",
      columns: 2,
      fields: [
        { name: "parentName", label: "Parent/Guardian Name", type: "text", placeholder: "Parent name" },
        { name: "parentContactNo", label: "Parent Phone No.", type: "tel", placeholder: "Parent phone" },
      ],
    },
    {
      title: "Address & Source",
      columns: 2,
      fields: [
        { name: "address", label: "Address", type: "text", placeholder: "Full address" },
        {
          name: "sourceOfInformation",
          label: "How did you hear about us?",
          type: "select",
          required: true,
          options: [
            { value: "Friend", label: "Friend" },
            { value: "Facebook", label: "Facebook" },
            { value: "Pamphlet", label: "Pamphlet" },
            { value: "Newspaper", label: "Newspaper" },
            { value: "Others", label: "Others" },
          ],
        },
      ],
    },
    {
      title: "Notes",
      fields: [
        { name: "remark", label: "Remark", type: "textarea", placeholder: "Additional notes..." },
      ],
    },
  ],
};
