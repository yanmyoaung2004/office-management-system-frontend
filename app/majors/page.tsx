"use client";
import useSWR from "swr";
import type { UserRole, Major } from "@/types";
import { apiDelete, apiPost, apiPut } from "@/lib/api-client";
import { MajorManagement } from "@/components/major-management";
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
  // --- Data State (from backend via SWR) ---
  const { data: majorsResponse, mutate: mutateMajors } = useSWR<
    PaginatedResponse<Major>
  >(currentRole !== "staff" ? "/majors?page=1&limit=200" : null, swrOptions);

  const majors = majorsResponse?.data ?? [];

  const handleAddMajor = async (newMajor: Omit<Major, "id">) => {
    await apiPost(`/majors`, newMajor);
    await mutateMajors();
  };

  const handleUpdateMajor = async (newMajor: Major) => {
    await apiPut(`/majors/${newMajor.id}`, newMajor);
    await mutateMajors();
  };

  const handleDeleteMajor = async (majorId: string) => {
    await apiDelete(`/majors/${majorId}`);
    await mutateMajors();
  };
  if (isLoading) return <div className="bg-background" />;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MajorManagement
        majors={majors}
        onAddMajor={handleAddMajor}
        onDeleteMajor={handleDeleteMajor}
        onUpdateMajor={handleUpdateMajor}
      />
    </main>
  );
}
