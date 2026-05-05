"use client";
import { useAuth } from "@/context/AuthContext";

export default function FinancePage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Operation Department</h1>
      {user ? (
        <p>Welcome, {user.fullName}! This is the operation department page.</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
