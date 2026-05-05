"use client";

import React, { useState } from "react";
import { migrationData } from "@/asset/migration";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api-client";
import { Student } from "@/types";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

// Utility: Define outside the component to prevent re-creation on every render
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const { isLoading: authLoading } = useAuth();
  const [intakeId, setIntakeId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: migrationData.length,
  });

  const handleEnrollStudent = async (newStudent: Omit<Student, "id">) => {
    // Ensure this returns the promise from apiPost
    return await apiPost("/students", newStudent);
  };

  const handleEnroll = async () => {
    if (!intakeId || intakeId === "") {
      alert("Please fill intake");
      return;
    }
    if (!migrationData || migrationData.length === 0) {
      console.error("No data found in migration file.");
      return;
    }

    // Prevent multiple simultaneous migration triggers
    setIsProcessing(true);
    console.log("Starting migration process...");

    for (let i = 0; i < migrationData.length; i++) {
      const m = migrationData[i];
      setProgress({ current: i + 1, total: migrationData.length });

      try {
        await handleEnrollStudent({
          street: m.street,
          city: m.city,
          region: m.region,
          fullName: m.fullname,
          educationLevel: m.education,
          gender: m.gender,
          nrc: m.nrc ? m.nrc.toUpperCase() : "N/A",
          birthDate: m.birthdate,
          studentPhoneNo: m.phone_number,
          parentName: m.parent_name,
          parentPhoneNo: m.parent_phone,
          email: !m.email || m.email === "-" ? "unknown@gmail.com" : m.email,
          scholar: m.Scholar,
          firstInstallmentFee: true,
          registrationFee: true,
          enrolledDate: m.enrolled_date,
          nrcCopy: true,
          censusCopy: true,
          passportPhoto: true,
          educationCertificate: true,
          referralName: "none",
          remark: "BE21",
          intakeId: intakeId,
          intakeCode: "",
          status: "Graduated",
        });

        console.log(
          `[${i + 1}/${migrationData.length}] Enrolled: ${m.fullname}`,
        );

        // Wait 3 seconds before next iteration
        await sleep(3000);
      } catch (error) {
        console.error(`Error enrolling ${m.fullname}:`, error);
        // Continue to next student even if one fails
        continue;
      }
    }

    console.log("Migration complete.");
    setIsProcessing(false);
  };

  if (authLoading) return <div className="bg-background min-h-screen" />;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-3 items-center">
        <Input
          placeholder="Intake ID"
          value={intakeId}
          onChange={(e) => setIntakeId(e.target.value)}
          className="bg-white text-sm max-w-2xl"
        />
        <Button onClick={handleEnroll} disabled={isProcessing}>
          {isProcessing
            ? `Processing (${progress.current}/${progress.total})`
            : "Start Migration"}
        </Button>

        {isProcessing && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Do not close this tab until migration is finished.
          </p>
        )}
      </div>
    </main>
  );
}
