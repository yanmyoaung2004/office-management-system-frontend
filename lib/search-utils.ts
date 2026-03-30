import type { Intake, Major, Student } from "@/types";

function fuzzyMatch(searchTerm: string, targetString: string): boolean {
  const searchLower = searchTerm.toLowerCase();
  const targetLower = targetString.toLowerCase();
  if (targetLower.includes(searchLower)) return true;
  const searchTokens = searchLower.split(/\s+/);
  return searchTokens.every((token) => targetLower.includes(token));
}

export function searchStudents(students: Student[], query: string): Student[] {
  if (!query.trim()) return students;

  return students.filter((student) => {
    return (
      fuzzyMatch(query, student.fullName) ||
      fuzzyMatch(query, student.nrc) ||
      fuzzyMatch(query, student.parentName) ||
      fuzzyMatch(query, student.email) ||
      fuzzyMatch(query, student.studentPhoneNo) ||
      fuzzyMatch(query, student.parentPhoneNo) ||
      fuzzyMatch(query, student.majorName ? student.majorName : "") ||
      fuzzyMatch(query, student.intakeCode ? student.intakeCode : "") ||
      fuzzyMatch(query, student.status)
    );
  });
}

export function filterStudents(
  students: Student[],
  filters: {
    major?: string;
    intake?: string;
    status?: string;
    informationStatus?: string;
    gender?: string;
    scholar?: boolean;
  },
): Student[] {
  return students.filter((student) => {
    if (filters.major && student.majorName !== filters.major) return false;
    if (filters.intake && student.intakeId !== filters.intake) return false;
    if (filters.status && student.status !== filters.status) return false;
    if (filters.informationStatus === "complete") {
      return (
        student.nrcCopy &&
        student.passportPhoto &&
        student.censusCopy &&
        student.educationCertificate
      );
    }
    if (filters.informationStatus === "incomplete") {
      return !(
        student.nrcCopy &&
        student.passportPhoto &&
        student.censusCopy &&
        student.educationCertificate
      );
    }
    if (filters.gender && student.gender !== filters.gender) return false;
    if (filters.scholar !== undefined && student.scholar !== filters.scholar)
      return false;
    return true;
  });
}

export function searchIntakes(intakes: Intake[], query: string): Intake[] {
  if (!query.trim()) return intakes;

  return intakes.filter((intake) => {
    return (
      fuzzyMatch(query, intake.code) ||
      fuzzyMatch(query, intake.majorName) ||
      fuzzyMatch(query, intake.year.toString()) ||
      fuzzyMatch(query, intake.currentStatus) ||
      fuzzyMatch(query, intake.startDate)
    );
  });
}

export function filterIntakes(
  intakes: Intake[],
  filters: {
    major?: string;
  },
): Intake[] {
  return intakes.filter((intake) => {
    if (filters.major && intake.majorId !== filters.major) return false;
    return true;
  });
}

export function searchMajors(majors: Major[], query: string): Major[] {
  if (!query.trim()) return majors;

  return majors.filter((major) => {
    return (
      fuzzyMatch(query, major.code) ||
      fuzzyMatch(query, major.name) ||
      fuzzyMatch(query, major.description)
    );
  });
}
