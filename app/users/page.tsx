"use client";
import useSWR from "swr";
import type { User, UserRole } from "@/types";

// Components
import { UserManagement } from "@/components/user-management";
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

  const { data: usersResponse, mutate: mutateUsers } = useSWR<
    PaginatedResponse<User>
  >(currentRole !== "staff" ? "/users?page=1&limit=200" : null, swrOptions);

  const users = usersResponse?.data ?? [];

  const handleAddUser = async (newUser: Omit<User, "id">) => {
    await apiPost("/users", newUser);
    await mutateUsers();
  };

  const handleUpdateUser = async (newUser: User) => {
    await apiPut(`/users/${newUser.id}`, newUser);
    await mutateUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    await apiDelete(`/users/${userId}`);
    await mutateUsers();
  };

  if (isLoading) return <div className="bg-background" />;
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentRole === "Admissions" && (
        <UserManagement
          users={users}
          onUpdateUser={handleUpdateUser}
          currentRole={currentRole}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </main>
  );
}
