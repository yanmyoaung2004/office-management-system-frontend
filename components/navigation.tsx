"use client";

import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Notification } from "./notification";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Navigation() {
  const { user, logout } = useAuth();
  const currentRole = user?.role as UserRole;
  const currentDepartment = user?.department;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTab = usePathname();
  const router = useRouter();

  const departmentTabs: Record<
    string,
    { id: string; label: string; roles: UserRole[]; permissions: string[] }[]
  > = {
    ADMISSIONS: [
      {
        id: "/dashboard",
        label: "Dashboard",
        roles: ["Admissions", "staff", "readonly"] as UserRole[],
        permissions: ["view_enrollment"],
      },
      {
        id: "/admission/enrollment",
        label: "Enrollment",
        roles: ["Admissions", "staff"] as UserRole[],
        permissions: ["view_enrollment"],
      },
      {
        id: "/admission/intakes",
        label: "Intakes",
        roles: ["Admissions"] as UserRole[],
        permissions: ["view_enrollment"],
      },
      {
        id: "/admission/majors",
        label: "Majors",
        roles: ["Admissions"] as UserRole[],
        permissions: ["view_enrollment"],
      },
      {
        id: "/admission/inquiries",
        label: "Inquiries",
        roles: ["Admissions", "staff", "readonly"] as UserRole[],
        permissions: ["view_enrollment"],
      },
      {
        id: "/admission/users",
        label: "Users",
        roles: ["Admissions"] as UserRole[],
        permissions: ["view_enrollment"],
      },
    ],
    FINANCE: [
      {
        id: "/finance/intakes",
        label: "Intakes",
        roles: ["Finance Staff"],
        permissions: ["view_enrollment"],
      },
    ],
    EXAM: [
      {
        id: "/exam/intakes",
        label: "Intakes",
        roles: ["Exam Staff"],
        permissions: ["view_intake"],
      },
      {
        id: "/exam/exams",
        label: "Exams",
        roles: ["Exam Staff"],
        permissions: ["view_exam"],
      },
    ],
  };

  const rawDepartmentTabs = departmentTabs[currentDepartment || ""] || [];
  const visibleTabs = rawDepartmentTabs.filter((tab) => {
    return user?.permissions?.some((p) => tab.permissions.includes(p));
  });
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (activeTab === "/login") {
    return null;
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Image
              alt="STI Myanmar College"
              src={"/logo.png"}
              width={100}
              height={50}
            />
            <div className="hidden md:flex space-x-0 lg:space-x-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1">
              <div className="hidden sm:flex items-center space-x-2">
                <Notification currentRole={currentRole} />
              </div>

              <span className="text-sm font-medium text-foreground capitalize hidden lg:block">
                {currentRole}
              </span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="hover:bg-muted"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-md"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  router.push(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
