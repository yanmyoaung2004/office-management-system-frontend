"use client";

import useSWR from "swr";
import type { Intake, UserRole, Major } from "@/types";
// Components
import { IntakeManagement } from "@/components/intake-management";
import { apiDelete, apiPost, apiPut } from "@/lib/api-client";
import { useAuth } from "@/hooks/useUserRole";

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
  const { data: intakesResponse, mutate: mutateIntakes } = useSWR<
    PaginatedResponse<Intake>
  >(currentRole !== "staff" ? "/intakes?page=1&limit=200" : null, swrOptions);
  const { data: majorsResponse } = useSWR<PaginatedResponse<Major>>(
    currentRole !== "staff" ? "/majors?page=1&limit=200" : null,
    swrOptions,
  );

  const intakes = intakesResponse?.data ?? [];
  const majors = majorsResponse?.data ?? [];

  const handleAddIntake = async (newIntake: Omit<Intake, "id">) => {
    await apiPost("/intakes", newIntake);
    await mutateIntakes();
  };

  const handleUpdateIntake = async (newIntake: Intake) => {
    await apiPut(`/intakes/${newIntake.id}`, newIntake);
    await mutateIntakes();
  };

  const handleDeleteIntake = async (intakeId: string) => {
    await apiDelete(`/intakes/${intakeId}`);
    await mutateIntakes();
  };

  if (isLoading) return <div className="bg-background" />;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentRole === "admin" && (
        <IntakeManagement
          intakes={intakes}
          majors={majors}
          onUpdateIntake={handleUpdateIntake}
          onAddIntake={handleAddIntake}
          onDeleteIntake={handleDeleteIntake}
        />
      )}
    </main>
  );
}
