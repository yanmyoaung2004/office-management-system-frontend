"use client";
import { useAuth } from "@/context/AuthContext";
import { Department, User } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

interface Props {
  children: React.ReactNode;
  allowedDepartments: Department[];
}

export const PermissionGuard = ({ children, allowedDepartments }: Props) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const canAccess = useMemo(() => {
    if (!user) return false;
    if (user.department === "DIRECTORATE") return true;
    return allowedDepartments.includes(user.department as Department);
  }, [user, allowedDepartments]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!canAccess) {
        router.push("/unauthorized");
      }
    }
  }, [user, isLoading, canAccess, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking permissions...</p>
      </div>
    );
  }

  // Use the same logic check for rendering as the redirect logic
  if (user && canAccess) {
    return <>{children}</>;
  }

  return null;
};
