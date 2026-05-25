/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Path, UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ZodSchema } from "zod";

export type { FieldValues };

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "date"
  | "select"
  | "multi-select"
  | "checkbox"
  | "switch"
  | "textarea"
  | "file"
  | "custom";

export interface BaseFieldDef<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  description?: string;
  className?: string;
  colSpan?: 1 | 2;
}

export interface TextFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "text" | "email" | "tel" | "number";
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface SelectFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "select";
  options: { value: string; label: string }[];
  searchable?: boolean;
}

export interface MultiSelectFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "multi-select";
  options: { value: string; label: string }[];
  fetchEndpoint?: string;
}

export interface DateFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "date";
  min?: string;
  max?: string;
}

export interface CheckboxFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "checkbox";
}

export interface TextareaFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "textarea";
  rows?: number;
}

export interface FileFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "file";
  accept?: string;
  maxSize?: number;
}

export interface CustomFieldDef<T extends FieldValues> extends BaseFieldDef<T> {
  type: "custom";
  render: (form: UseFormReturn<T>) => React.ReactNode;
}

export type FieldDef<T extends FieldValues> =
  | TextFieldDef<T>
  | SelectFieldDef<T>
  | MultiSelectFieldDef<T>
  | DateFieldDef<T>
  | CheckboxFieldDef<T>
  | TextareaFieldDef<T>
  | FileFieldDef<T>
  | CustomFieldDef<T>;

export interface FormSection<T extends FieldValues> {
  title?: string;
  description?: string;
  fields: FieldDef<T>[];
  columns?: 1 | 2;
}

export interface FormConfig<T extends FieldValues> {
  entityName: string;
  entityNamePlural?: string;
  schema: ZodSchema<T>;
  sections: FormSection<T>[];
  defaultValues: T;
  createEndpoint: string;
  updateEndpoint?: (id: string) => string;
  detailRoute?: (id: string) => string;
  listRoute?: string;
  requiredPermission?: string;
  successMessage?: string;
  errorMessage?: string;
}

export interface EntityListColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface EntityListConfig<T> {
  columns: EntityListColumn<T>[];
  searchFields?: string[];
  defaultSort?: { key: string; direction: "asc" | "desc" };
  itemsPerPage?: number;
  emptyMessage?: string;
  rowActions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export interface EntityPageConfig<T extends FieldValues> {
  title: string;
  description?: string;
  listConfig: EntityListConfig<any>;
  formConfig: FormConfig<T>;
  fetchEndpoint: string;
  deleteEndpoint?: (id: string) => string;
  swrKey: string;
}
