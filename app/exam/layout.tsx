"use client";

import { PermissionGuard } from "@/components/PermissionGuard";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard allowedDepartments={["EXAM"]}>{children}</PermissionGuard>
  );
}
