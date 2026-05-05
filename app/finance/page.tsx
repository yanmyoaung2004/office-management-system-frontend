"use client";
import { useAuth } from "@/context/AuthContext";

export default function FinancePage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Finance Department</h1>
      {user ? (
        <p>Welcome, {user.fullName}! This is the finance department page.</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
