export interface Semester {
  id: string;
  semesterNumber?: number;
  name: string;
}

export type Year =
  | {
      id: string | null;
      type: "FOUNDATION";
      name: string;
      yearNumber: null;
      semesters: Semester[];
    }
  | {
      id: string | null;
      type: "NORMAL";
      name: string;
      yearNumber: number;
      semesters: Semester[];
    };

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Major {
  id: string;
  code: string;
  name: string;
  description: string;
  years: Year[];
}

export interface MajorFormData {
  code: string;
  name: string;
  description: string;
  years: Year[];
}

export interface MajorListResponse {
  success: boolean;
  data: Major[];
}

export interface SubjectHierarchyNode {
  id: string;
  name: string;
  code?: string;
  children?: SubjectHierarchyNode[];
  subjects?: Subject[];
}

export interface SubjectFormData {
  code: string;
  name: string;
  description: string;
}

export interface BatchSubjectFormData {
  subjects: SubjectFormData[];
}
