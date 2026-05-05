"use client";

import { PermissionGuard } from "@/components/PermissionGuard";

export default function AdmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard allowedDepartments={["ADMISSIONS"]}>
      {children}
    </PermissionGuard>
  );
}
