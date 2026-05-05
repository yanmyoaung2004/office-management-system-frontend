"use client";

import useSWR from "swr";
import type { Student, Intake, UserRole, Major } from "@/types";

// Components
import { Dashboard } from "@/components/dashboard";
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

  const { data: studentsResponse } = useSWR<PaginatedResponse<Student>>(
    "/students?page=1&limit=200",
    swrOptions,
  );
  const { data: intakesResponse } = useSWR<PaginatedResponse<Intake>>(
    currentRole !== "staff" ? "/intakes?page=1&limit=200" : null,
    swrOptions,
  );
  const { data: majorsResponse } = useSWR<PaginatedResponse<Major>>(
    currentRole !== "staff" ? "/majors?page=1&limit=200" : null,
    swrOptions,
  );

  const students = studentsResponse?.data ?? [];
  const intakes = intakesResponse?.data ?? [];
  const majors = majorsResponse?.data ?? [];

  // Prevent "flash" of content before auth check
  if (isLoading) return <div className="bg-background" />;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Dashboard
        students={students}
        majors={majors}
        intakes={intakes}
        currentRole={currentRole}
      />
    </main>
  );
}
