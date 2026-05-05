"use client";
import useSWR from "swr";
import type { UserRole, Intake } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { FinanceIntakeManagement } from "@/components/finance/intake-management";

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
    currentRole !== "staff" ? "/finance/intakes?page=1&limit=200" : null,
    swrOptions,
  );

  const intakes = intakesResponse?.data ?? [];

  if (isLoading) return <div className="bg-background" />;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FinanceIntakeManagement intakes={intakes} />
    </main>
  );
}
