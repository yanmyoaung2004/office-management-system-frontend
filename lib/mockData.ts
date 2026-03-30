export interface StudentData {
  id: string;
  year: number;
  intake: string;
  major: string;
  enrolledCount: number;
  graduatedCount: number;
  passRate: number;
  avgGPA: number;
  month?: number;
  location: string;
  locationCount: number;
}

export const mockStudentData: StudentData[] = [
  // 2022 - CS
  { id: "2022-cs-1", year: 2022, intake: "CS", major: "CS", enrolledCount: 150, graduatedCount: 140, passRate: 93, avgGPA: 3.5, month: 1, location: "Karachi", locationCount: 45 },
  { id: "2022-cs-1b", year: 2022, intake: "CS", major: "CS", enrolledCount: 150, graduatedCount: 140, passRate: 93, avgGPA: 3.5, month: 1, location: "Lahore", locationCount: 38 },
  { id: "2022-cs-1c", year: 2022, intake: "CS", major: "CS", enrolledCount: 150, graduatedCount: 140, passRate: 93, avgGPA: 3.5, month: 1, location: "Islamabad", locationCount: 32 },
  { id: "2022-cs-1d", year: 2022, intake: "CS", major: "CS", enrolledCount: 150, graduatedCount: 140, passRate: 93, avgGPA: 3.5, month: 1, location: "Rawalpindi", locationCount: 25 },
  { id: "2022-cs-1e", year: 2022, intake: "CS", major: "CS", enrolledCount: 150, graduatedCount: 140, passRate: 93, avgGPA: 3.5, month: 1, location: "Peshawar", locationCount: 10 },
  { id: "2022-cs-2", year: 2022, intake: "CS", major: "CS", enrolledCount: 155, graduatedCount: 145, passRate: 94, avgGPA: 3.6, month: 6, location: "Karachi", locationCount: 48 },
  { id: "2022-cs-2b", year: 2022, intake: "CS", major: "CS", enrolledCount: 155, graduatedCount: 145, passRate: 94, avgGPA: 3.6, month: 6, location: "Lahore", locationCount: 40 },
  { id: "2022-cs-2c", year: 2022, intake: "CS", major: "CS", enrolledCount: 155, graduatedCount: 145, passRate: 94, avgGPA: 3.6, month: 6, location: "Islamabad", locationCount: 34 },
  { id: "2022-cs-2d", year: 2022, intake: "CS", major: "CS", enrolledCount: 155, graduatedCount: 145, passRate: 94, avgGPA: 3.6, month: 6, location: "Rawalpindi", locationCount: 28 },
  { id: "2022-cs-2e", year: 2022, intake: "CS", major: "CS", enrolledCount: 155, graduatedCount: 145, passRate: 94, avgGPA: 3.6, month: 6, location: "Peshawar", locationCount: 5 },
  { id: "2022-cs-3", year: 2022, intake: "CS", major: "CS", enrolledCount: 160, graduatedCount: 148, passRate: 92, avgGPA: 3.5, month: 12, location: "Karachi", locationCount: 50 },
  { id: "2022-cs-3b", year: 2022, intake: "CS", major: "CS", enrolledCount: 160, graduatedCount: 148, passRate: 92, avgGPA: 3.5, month: 12, location: "Lahore", locationCount: 42 },
  { id: "2022-cs-3c", year: 2022, intake: "CS", major: "CS", enrolledCount: 160, graduatedCount: 148, passRate: 92, avgGPA: 3.5, month: 12, location: "Islamabad", locationCount: 36 },
  { id: "2022-cs-3d", year: 2022, intake: "CS", major: "CS", enrolledCount: 160, graduatedCount: 148, passRate: 92, avgGPA: 3.5, month: 12, location: "Rawalpindi", locationCount: 28 },
  { id: "2022-cs-3e", year: 2022, intake: "CS", major: "CS", enrolledCount: 160, graduatedCount: 148, passRate: 92, avgGPA: 3.5, month: 12, location: "Peshawar", locationCount: 4 },

  // 2022 - Engineering
  { id: "2022-eng-1", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 120, graduatedCount: 110, passRate: 91, avgGPA: 3.4, month: 1, location: "Karachi", locationCount: 35 },
  { id: "2022-eng-1b", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 120, graduatedCount: 110, passRate: 91, avgGPA: 3.4, month: 1, location: "Lahore", locationCount: 32 },
  { id: "2022-eng-1c", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 120, graduatedCount: 110, passRate: 91, avgGPA: 3.4, month: 1, location: "Islamabad", locationCount: 28 },
  { id: "2022-eng-1d", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 120, graduatedCount: 110, passRate: 91, avgGPA: 3.4, month: 1, location: "Peshawar", locationCount: 25 },
  { id: "2022-eng-2", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 125, graduatedCount: 115, passRate: 92, avgGPA: 3.5, month: 6, location: "Karachi", locationCount: 36 },
  { id: "2022-eng-2b", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 125, graduatedCount: 115, passRate: 92, avgGPA: 3.5, month: 6, location: "Lahore", locationCount: 34 },
  { id: "2022-eng-2c", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 125, graduatedCount: 115, passRate: 92, avgGPA: 3.5, month: 6, location: "Islamabad", locationCount: 30 },
  { id: "2022-eng-2d", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 125, graduatedCount: 115, passRate: 92, avgGPA: 3.5, month: 6, location: "Peshawar", locationCount: 25 },
  { id: "2022-eng-3", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 130, graduatedCount: 120, passRate: 91, avgGPA: 3.4, month: 12, location: "Karachi", locationCount: 38 },
  { id: "2022-eng-3b", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 130, graduatedCount: 120, passRate: 91, avgGPA: 3.4, month: 12, location: "Lahore", locationCount: 35 },
  { id: "2022-eng-3c", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 130, graduatedCount: 120, passRate: 91, avgGPA: 3.4, month: 12, location: "Islamabad", locationCount: 32 },
  { id: "2022-eng-3d", year: 2022, intake: "Engineering", major: "Engineering", enrolledCount: 130, graduatedCount: 120, passRate: 91, avgGPA: 3.4, month: 12, location: "Peshawar", locationCount: 25 },

  // 2022 - Physics
  { id: "2022-ph-1", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 80, graduatedCount: 72, passRate: 90, avgGPA: 3.3, month: 1, location: "Karachi", locationCount: 22 },
  { id: "2022-ph-1b", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 80, graduatedCount: 72, passRate: 90, avgGPA: 3.3, month: 1, location: "Lahore", locationCount: 20 },
  { id: "2022-ph-1c", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 80, graduatedCount: 72, passRate: 90, avgGPA: 3.3, month: 1, location: "Islamabad", locationCount: 18 },
  { id: "2022-ph-1d", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 80, graduatedCount: 72, passRate: 90, avgGPA: 3.3, month: 1, location: "Peshawar", locationCount: 20 },
  { id: "2022-ph-2", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 85, graduatedCount: 76, passRate: 89, avgGPA: 3.2, month: 6, location: "Karachi", locationCount: 24 },
  { id: "2022-ph-2b", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 85, graduatedCount: 76, passRate: 89, avgGPA: 3.2, month: 6, location: "Lahore", locationCount: 21 },
  { id: "2022-ph-2c", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 85, graduatedCount: 76, passRate: 89, avgGPA: 3.2, month: 6, location: "Islamabad", locationCount: 19 },
  { id: "2022-ph-2d", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 85, graduatedCount: 76, passRate: 89, avgGPA: 3.2, month: 6, location: "Peshawar", locationCount: 21 },
  { id: "2022-ph-3", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 90, graduatedCount: 80, passRate: 88, avgGPA: 3.3, month: 12, location: "Karachi", locationCount: 26 },
  { id: "2022-ph-3b", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 90, graduatedCount: 80, passRate: 88, avgGPA: 3.3, month: 12, location: "Lahore", locationCount: 23 },
  { id: "2022-ph-3c", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 90, graduatedCount: 80, passRate: 88, avgGPA: 3.3, month: 12, location: "Islamabad", locationCount: 21 },
  { id: "2022-ph-3d", year: 2022, intake: "Physics", major: "Physics", enrolledCount: 90, graduatedCount: 80, passRate: 88, avgGPA: 3.3, month: 12, location: "Peshawar", locationCount: 20 },

  // 2023 - CS
  { id: "2023-cs-1", year: 2023, intake: "CS", major: "CS", enrolledCount: 180, graduatedCount: 165, passRate: 92, avgGPA: 3.6, month: 1, location: "Karachi", locationCount: 55 },
  { id: "2023-cs-1b", year: 2023, intake: "CS", major: "CS", enrolledCount: 180, graduatedCount: 165, passRate: 92, avgGPA: 3.6, month: 1, location: "Lahore", locationCount: 48 },
  { id: "2023-cs-1c", year: 2023, intake: "CS", major: "CS", enrolledCount: 180, graduatedCount: 165, passRate: 92, avgGPA: 3.6, month: 1, location: "Islamabad", locationCount: 42 },
  { id: "2023-cs-1d", year: 2023, intake: "CS", major: "CS", enrolledCount: 180, graduatedCount: 165, passRate: 92, avgGPA: 3.6, month: 1, location: "Peshawar", locationCount: 35 },
  { id: "2023-cs-2", year: 2023, intake: "CS", major: "CS", enrolledCount: 185, graduatedCount: 170, passRate: 92, avgGPA: 3.7, month: 6, location: "Karachi", locationCount: 58 },
  { id: "2023-cs-2b", year: 2023, intake: "CS", major: "CS", enrolledCount: 185, graduatedCount: 170, passRate: 92, avgGPA: 3.7, month: 6, location: "Lahore", locationCount: 50 },
  { id: "2023-cs-2c", year: 2023, intake: "CS", major: "CS", enrolledCount: 185, graduatedCount: 170, passRate: 92, avgGPA: 3.7, month: 6, location: "Islamabad", locationCount: 44 },
  { id: "2023-cs-2d", year: 2023, intake: "CS", major: "CS", enrolledCount: 185, graduatedCount: 170, passRate: 92, avgGPA: 3.7, month: 6, location: "Peshawar", locationCount: 33 },
  { id: "2023-cs-3", year: 2023, intake: "CS", major: "CS", enrolledCount: 190, graduatedCount: 175, passRate: 92, avgGPA: 3.6, month: 12, location: "Karachi", locationCount: 62 },
  { id: "2023-cs-3b", year: 2023, intake: "CS", major: "CS", enrolledCount: 190, graduatedCount: 175, passRate: 92, avgGPA: 3.6, month: 12, location: "Lahore", locationCount: 52 },
  { id: "2023-cs-3c", year: 2023, intake: "CS", major: "CS", enrolledCount: 190, graduatedCount: 175, passRate: 92, avgGPA: 3.6, month: 12, location: "Islamabad", locationCount: 46 },
  { id: "2023-cs-3d", year: 2023, intake: "CS", major: "CS", enrolledCount: 190, graduatedCount: 175, passRate: 92, avgGPA: 3.6, month: 12, location: "Peshawar", locationCount: 30 },

  // 2023 - Engineering
  { id: "2023-eng-1", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 140, graduatedCount: 128, passRate: 91, avgGPA: 3.5, month: 1, location: "Karachi", locationCount: 42 },
  { id: "2023-eng-1b", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 140, graduatedCount: 128, passRate: 91, avgGPA: 3.5, month: 1, location: "Lahore", locationCount: 39 },
  { id: "2023-eng-1c", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 140, graduatedCount: 128, passRate: 91, avgGPA: 3.5, month: 1, location: "Islamabad", locationCount: 35 },
  { id: "2023-eng-1d", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 140, graduatedCount: 128, passRate: 91, avgGPA: 3.5, month: 1, location: "Peshawar", locationCount: 24 },
  { id: "2023-eng-2", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 145, graduatedCount: 133, passRate: 92, avgGPA: 3.6, month: 6, location: "Karachi", locationCount: 44 },
  { id: "2023-eng-2b", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 145, graduatedCount: 133, passRate: 92, avgGPA: 3.6, month: 6, location: "Lahore", locationCount: 41 },
  { id: "2023-eng-2c", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 145, graduatedCount: 133, passRate: 92, avgGPA: 3.6, month: 6, location: "Islamabad", locationCount: 37 },
  { id: "2023-eng-2d", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 145, graduatedCount: 133, passRate: 92, avgGPA: 3.6, month: 6, location: "Peshawar", locationCount: 23 },
  { id: "2023-eng-3", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 150, graduatedCount: 138, passRate: 92, avgGPA: 3.5, month: 12, location: "Karachi", locationCount: 46 },
  { id: "2023-eng-3b", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 150, graduatedCount: 138, passRate: 92, avgGPA: 3.5, month: 12, location: "Lahore", locationCount: 43 },
  { id: "2023-eng-3c", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 150, graduatedCount: 138, passRate: 92, avgGPA: 3.5, month: 12, location: "Islamabad", locationCount: 39 },
  { id: "2023-eng-3d", year: 2023, intake: "Engineering", major: "Engineering", enrolledCount: 150, graduatedCount: 138, passRate: 92, avgGPA: 3.5, month: 12, location: "Peshawar", locationCount: 22 },

  // 2023 - Physics
  { id: "2023-ph-1", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 100, graduatedCount: 90, passRate: 90, avgGPA: 3.4, month: 1, location: "Karachi", locationCount: 28 },
  { id: "2023-ph-1b", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 100, graduatedCount: 90, passRate: 90, avgGPA: 3.4, month: 1, location: "Lahore", locationCount: 26 },
  { id: "2023-ph-1c", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 100, graduatedCount: 90, passRate: 90, avgGPA: 3.4, month: 1, location: "Islamabad", locationCount: 24 },
  { id: "2023-ph-1d", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 100, graduatedCount: 90, passRate: 90, avgGPA: 3.4, month: 1, location: "Peshawar", locationCount: 22 },
  { id: "2023-ph-2", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 105, graduatedCount: 95, passRate: 90, avgGPA: 3.4, month: 6, location: "Karachi", locationCount: 30 },
  { id: "2023-ph-2b", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 105, graduatedCount: 95, passRate: 90, avgGPA: 3.4, month: 6, location: "Lahore", locationCount: 27 },
  { id: "2023-ph-2c", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 105, graduatedCount: 95, passRate: 90, avgGPA: 3.4, month: 6, location: "Islamabad", locationCount: 26 },
  { id: "2023-ph-2d", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 105, graduatedCount: 95, passRate: 90, avgGPA: 3.4, month: 6, location: "Peshawar", locationCount: 22 },
  { id: "2023-ph-3", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 110, graduatedCount: 100, passRate: 90, avgGPA: 3.5, month: 12, location: "Karachi", locationCount: 32 },
  { id: "2023-ph-3b", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 110, graduatedCount: 100, passRate: 90, avgGPA: 3.5, month: 12, location: "Lahore", locationCount: 29 },
  { id: "2023-ph-3c", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 110, graduatedCount: 100, passRate: 90, avgGPA: 3.5, month: 12, location: "Islamabad", locationCount: 27 },
  { id: "2023-ph-3d", year: 2023, intake: "Physics", major: "Physics", enrolledCount: 110, graduatedCount: 100, passRate: 90, avgGPA: 3.5, month: 12, location: "Peshawar", locationCount: 22 },

  // 2024 - CS
  { id: "2024-cs-1", year: 2024, intake: "CS", major: "CS", enrolledCount: 200, graduatedCount: 180, passRate: 93, avgGPA: 3.7, month: 1, location: "Karachi", locationCount: 65 },
  { id: "2024-cs-1b", year: 2024, intake: "CS", major: "CS", enrolledCount: 200, graduatedCount: 180, passRate: 93, avgGPA: 3.7, month: 1, location: "Lahore", locationCount: 58 },
  { id: "2024-cs-1c", year: 2024, intake: "CS", major: "CS", enrolledCount: 200, graduatedCount: 180, passRate: 93, avgGPA: 3.7, month: 1, location: "Islamabad", locationCount: 48 },
  { id: "2024-cs-1d", year: 2024, intake: "CS", major: "CS", enrolledCount: 200, graduatedCount: 180, passRate: 93, avgGPA: 3.7, month: 1, location: "Peshawar", locationCount: 29 },
  { id: "2024-cs-2", year: 2024, intake: "CS", major: "CS", enrolledCount: 210, graduatedCount: 190, passRate: 93, avgGPA: 3.7, month: 6, location: "Karachi", locationCount: 70 },
  { id: "2024-cs-2b", year: 2024, intake: "CS", major: "CS", enrolledCount: 210, graduatedCount: 190, passRate: 93, avgGPA: 3.7, month: 6, location: "Lahore", locationCount: 62 },
  { id: "2024-cs-2c", year: 2024, intake: "CS", major: "CS", enrolledCount: 210, graduatedCount: 190, passRate: 93, avgGPA: 3.7, month: 6, location: "Islamabad", locationCount: 50 },
  { id: "2024-cs-2d", year: 2024, intake: "CS", major: "CS", enrolledCount: 210, graduatedCount: 190, passRate: 93, avgGPA: 3.7, month: 6, location: "Peshawar", locationCount: 28 },

  // 2024 - Engineering
  { id: "2024-eng-1", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 160, graduatedCount: 145, passRate: 91, avgGPA: 3.5, month: 1, location: "Karachi", locationCount: 50 },
  { id: "2024-eng-1b", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 160, graduatedCount: 145, passRate: 91, avgGPA: 3.5, month: 1, location: "Lahore", locationCount: 46 },
  { id: "2024-eng-1c", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 160, graduatedCount: 145, passRate: 91, avgGPA: 3.5, month: 1, location: "Islamabad", locationCount: 40 },
  { id: "2024-eng-1d", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 160, graduatedCount: 145, passRate: 91, avgGPA: 3.5, month: 1, location: "Peshawar", locationCount: 24 },
  { id: "2024-eng-2", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 170, graduatedCount: 155, passRate: 91, avgGPA: 3.6, month: 6, location: "Karachi", locationCount: 53 },
  { id: "2024-eng-2b", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 170, graduatedCount: 155, passRate: 91, avgGPA: 3.6, month: 6, location: "Lahore", locationCount: 49 },
  { id: "2024-eng-2c", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 170, graduatedCount: 155, passRate: 91, avgGPA: 3.6, month: 6, location: "Islamabad", locationCount: 43 },
  { id: "2024-eng-2d", year: 2024, intake: "Engineering", major: "Engineering", enrolledCount: 170, graduatedCount: 155, passRate: 91, avgGPA: 3.6, month: 6, location: "Peshawar", locationCount: 25 },

  // 2024 - Physics
  { id: "2024-ph-1", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 120, graduatedCount: 108, passRate: 90, avgGPA: 3.4, month: 1, location: "Karachi", locationCount: 35 },
  { id: "2024-ph-1b", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 120, graduatedCount: 108, passRate: 90, avgGPA: 3.4, month: 1, location: "Lahore", locationCount: 32 },
  { id: "2024-ph-1c", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 120, graduatedCount: 108, passRate: 90, avgGPA: 3.4, month: 1, location: "Islamabad", locationCount: 30 },
  { id: "2024-ph-1d", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 120, graduatedCount: 108, passRate: 90, avgGPA: 3.4, month: 1, location: "Peshawar", locationCount: 23 },
  { id: "2024-ph-2", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 125, graduatedCount: 112, passRate: 89, avgGPA: 3.5, month: 6, location: "Karachi", locationCount: 37 },
  { id: "2024-ph-2b", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 125, graduatedCount: 112, passRate: 89, avgGPA: 3.5, month: 6, location: "Lahore", locationCount: 34 },
  { id: "2024-ph-2c", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 125, graduatedCount: 112, passRate: 89, avgGPA: 3.5, month: 6, location: "Islamabad", locationCount: 32 },
  { id: "2024-ph-2d", year: 2024, intake: "Physics", major: "Physics", enrolledCount: 125, graduatedCount: 112, passRate: 89, avgGPA: 3.5, month: 6, location: "Peshawar", locationCount: 22 },
];

export const getAllYears = (): number[] => {
  const years = new Set(mockStudentData.map(d => d.year));
  return Array.from(years).sort((a, b) => b - a);
};

export const getAllIntakes = (): string[] => {
  const intakes = new Set(mockStudentData.map(d => d.intake));
  return Array.from(intakes).sort();
};

export const getAllMajors = (): string[] => {
  const majors = new Set(mockStudentData.map(d => d.major));
  return Array.from(majors).sort();
};

export const getMajorsByYear = (year: number): string[] => {
  const majors = new Set(mockStudentData.filter(d => d.year === year).map(d => d.major));
  return Array.from(majors).sort();
};

export const getMajorsByIntake = (intake: string): string[] => {
  const majors = new Set(mockStudentData.filter(d => d.intake === intake).map(d => d.major));
  return Array.from(majors).sort();
};
