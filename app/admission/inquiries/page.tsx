"use client";
import useSWR from "swr";
import type { Enquiry, FollowUpSession, UserRole } from "@/types";

// Components
import { InquiryManagement } from "@/components/inquiry-management";
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

export default function Home() {
  const { user, isLoading } = useAuth();
  const currentRole = user?.role as UserRole;

  const { data: enquiriesResponse, mutate: mutateEnquiries } = useSWR<
    PaginatedResponse<Enquiry>
  >("/admission/enquiries?page=1&limit=200", swrOptions);
  const enquiries = enquiriesResponse?.data ?? [];

  const handleAddEnquiry = async (newEnquiry: Omit<Enquiry, "id">) => {
    await apiPost("/admission/enquiries", newEnquiry);
    await mutateEnquiries();
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    await apiDelete(`/admission/enquiries/${enquiryId}`);
    await mutateEnquiries();
  };

  const handleAddFollowUp = async (
    enquiryId: string,
    followUp: Omit<FollowUpSession, "id" | "enquiryId">,
  ) => {
    await apiPost(`/admission/enquiries/${enquiryId}/followups`, followUp);
    await mutateEnquiries();
  };

  const handleUpdateFollowUp = async (
    followupId: string,
    followUp: FollowUpSession,
  ) => {
    await apiPut(`/admission/followups/${followupId}`, followUp);
    await mutateEnquiries();
  };

  const handleDeleteFollowUp = async (id: string) => {
    await apiDelete(`/admission/followups/${id}`);
    await mutateEnquiries();
  };

  if (isLoading) return <div className="bg-background" />;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <InquiryManagement
        enquiries={enquiries}
        currentRole={currentRole}
        onAddEnquiry={handleAddEnquiry}
        onDeleteEnquiry={handleDeleteEnquiry}
        onDeleteFollowUp={handleDeleteFollowUp}
        onUpdateFollowUp={handleUpdateFollowUp}
        onAddFollowUp={handleAddFollowUp}
      />
    </main>
  );
}
