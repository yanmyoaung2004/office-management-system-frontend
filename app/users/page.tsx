"use client";
import { UserManagement } from "@/components/user-management";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const currentRole = user?.role;

  if (isLoading) return <div className="bg-background" />;
  if (currentRole !== "Admissions") return null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UserManagement />
    </main>
  );
}
