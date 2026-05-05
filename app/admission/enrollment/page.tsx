"use client";

import { useState } from "react";
import useSWR from "swr";
import type { Student, Intake, UserRole, Major } from "@/types";

// Components
import { StudentDetail } from "@/components/student-detail";
import { EnrollmentManagement } from "@/components/enrollment-management";
import { apiDelete, apiPost, apiPut } from "@/lib/api-client";
import { DropoutType } from "@/components/dropout-modal";
import { CredentialType } from "@/components/reactivate-modal";
import { useAuth } from "@/context/AuthContext";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const swrOptions = {
  revalidateOnFocus: false, // Don't refetch when you click back on the window
  revalidateOnReconnect: false, // Don't refetch when internet reconnects
  dedupingInterval: 60000, // Consider data "fresh" for 1 minute
};

export default function Home() {
  const { user, isLoading } = useAuth();
  const currentRole = user?.role as UserRole;

  // --- Data State (from backend via SWR) ---
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: studentsResponse, mutate: mutateStudents } = useSWR<
    PaginatedResponse<Student>
  >("/admission/students?page=1&limit=200", swrOptions);
  const { data: intakesResponse } = useSWR<PaginatedResponse<Intake>>(
    currentRole !== "staff" ? "/admission/intakes?page=1&limit=200" : null,
    swrOptions,
  );

  const { data: majorsResponse } = useSWR<PaginatedResponse<Major>>(
    currentRole !== "staff" ? "/admission/majors?page=1&limit=200" : null,
    swrOptions,
  );

  const students = studentsResponse?.data ?? [];
  const intakes = intakesResponse?.data ?? [];
  const majors = majorsResponse?.data ?? [];

  const handleEnrollStudent = async (newStudent: Omit<Student, "id">) => {
    await apiPost("/admission/students", newStudent);
    await mutateStudents();
  };

  const handleMarkDropout = async (
    enrollmentId: string,
    reason: string,
    remark: string,
    type: DropoutType,
    followUpDate: string,
  ) => {
    console.log(followUpDate);

    const now = new Date();
    const dateOnly = now.toISOString().split("T")[0];
    const fullTimestamp = now.toISOString();
    const payload = {
      enrollmentId: enrollmentId,
      dropoutDate: dateOnly,
      reason: reason,
      remark: remark,
      createdAt: fullTimestamp,
      resultingStatus: type,
      followUpDate: followUpDate,
    };

    await apiPost("/admission/dropouts", payload);
    await mutateStudents();
    setSelectedStudent(null);
  };

  const handleUpdateStudent = async (newStudent: Student) => {
    await apiPut(`/admission/students/${newStudent.id}`, newStudent);
    await mutateStudents();
  };

  const handleDeleteStudent = async (studentId: string) => {
    await apiDelete(`/admission/students/${studentId}`);
    await mutateStudents();
  };

  const handleReactivate = async (
    credential: CredentialType,
    remark: string,
    intakeId: string,
  ) => {
    const payload = {
      student_id: credential.studentId,
      intake_id: intakeId,
      status: "Enrolled",
      enrolled_date: new Date().toISOString().split("T")[0],
      scholar: credential.scholar,
      registration_fee: credential.registrationFee,
      first_installment_fee: credential.firstInstallmentFee,
      nrc_copy: credential.nrcCopy,
      census_copy: credential.censusCopy,
      passport_photo: credential.passportPhoto,
      education_certificate: credential.educationCertificate,
      remark: remark,
    };
    await apiPost("/reactivate/", payload);
    await mutateStudents();
    setSelectedStudent(null);
  };

  if (isLoading) return <div className="bg-background" />;

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnrollmentManagement
          intakes={intakes}
          majors={majors}
          students={students}
          currentRole={currentRole}
          onViewDetail={setSelectedStudent}
          onEnrollStudent={handleEnrollStudent}
          onDelete={handleDeleteStudent}
          onUpdate={handleUpdateStudent}
        />
      </main>

      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onReactivate={handleReactivate}
          majors={majors}
          intakes={intakes}
          currentRole={currentRole}
          onClose={() => setSelectedStudent(null)}
          onDropout={handleMarkDropout}
        />
      )}
    </>
  );
}
