"use client";

import useSWR from "swr";
import {
  type Intake,
  type UserRole,
  type Major,
  CAN_VIEW_INTAKES,
  CAN_VIEW_MAJORS,
} from "@/types";
// Components
import { IntakeManagement } from "@/components/intake-management";
import { apiDelete, apiPost, apiPut } from "@/lib/api-client";
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

export default function Page() {
  const { user, isLoading } = useAuth();
  const currentRole = user?.role as UserRole;

  const { data: intakesResponse, mutate: mutateIntakes } = useSWR<
    PaginatedResponse<Intake>
  >(
    // Scalable check: Is the user's role in the approved list?
    currentRole && CAN_VIEW_INTAKES.includes(currentRole)
      ? "/admission/intakes?page=1&limit=200"
      : null,
    swrOptions,
  );

  const { data: majorsResponse } = useSWR<PaginatedResponse<Major>>(
    // Scalable check: Is the user's role in the approved list?
    currentRole && CAN_VIEW_MAJORS.includes(currentRole)
      ? "/admission/majors?page=1&limit=200"
      : null,
    swrOptions,
  );

  const intakes = intakesResponse?.data ?? [];
  const majors = majorsResponse?.data ?? [];

  const handleAddIntake = async (newIntake: Omit<Intake, "id">) => {
    await apiPost("/admission/intakes", newIntake);
    await mutateIntakes();
  };

  const handleUpdateIntake = async (newIntake: Intake) => {
    await apiPut(`/admission/intakes/${newIntake.id}`, newIntake);
    await mutateIntakes();
  };

  const handleDeleteIntake = async (intakeId: string) => {
    await apiDelete(`/admission/intakes/${intakeId}`);
    await mutateIntakes();
  };

  if (isLoading) return <div className="bg-background" />;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {(currentRole === "Admissions" || currentRole === "Directorate") && (
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
