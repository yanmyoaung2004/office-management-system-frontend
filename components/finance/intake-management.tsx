"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import type { Intake } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EntityList } from "@/components/entity-list";
import { apiGet, apiPost } from "@/lib/api-client";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import type { EntityListConfig } from "@/types/forms";

interface FinanceStudent {
  id: string;
  isPaid: boolean;
  studentId: string;
  fullName: string;
  studentPhoneNo: string;
  parentPhoneNo: string;
}

export function FinanceIntakeManagement() {
  const [selectedIntake, setSelectedIntake] = useState<Intake>();
  const [detailMode, setDetailMode] = useState<boolean>(false);
  const [students, setStudents] = useState<FinanceStudent[]>([]);
  const [payTarget, setPayTarget] = useState<FinanceStudent | null>(null);
  const { hasPermission } = usePermission();

  const { data: response, isLoading } = useSWR<{
    success: boolean;
    data: Intake[];
  }>("/finance/intakes?page=1&limit=200", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const intakes = useMemo(() => response?.data ?? [], [response]);

  const intakesRef = useRef(intakes);
  useEffect(() => {
    intakesRef.current = intakes;
  }, [intakes]);

  const handleViewIntakeDetails = useCallback(
    async (intakeId: string) => {
      if (!hasPermission("view_enrollment")) {
        toast.error("You don't have permission.");
        return;
      }
      const res = await apiGet<{
        success: boolean;
        data: FinanceStudent[];
      }>(`/finance/intakes/${intakeId}/enrollments`);

      const intake = intakesRef.current.find((i) => i.id === intakeId);
      if (intake) {
        setSelectedIntake(intake);
      }
      setStudents(res.data);
      setDetailMode(true);
    },
    [hasPermission],
  );

  const lastClickRef = useRef<number>(0);

  const handleRowClick = useCallback(
    (id: string) => {
      const currentTime = Date.now();
      const delay = 300;

      if (currentTime - lastClickRef.current < delay) {
        handleViewIntakeDetails(id);
        lastClickRef.current = 0;
        return;
      }

      lastClickRef.current = currentTime;
    },
    [handleViewIntakeDetails],
  );

  const handlePayment = useCallback(async () => {
    if (!payTarget || !selectedIntake) return;
    const res = await apiPost<{
      success: boolean;
      message: string;
      error: string;
    }>("/finance/fee/", {
      enrollment_id: payTarget.id,
      semester_id: selectedIntake.currentSemId,
    });
    if (res.success) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === payTarget.id ? { ...s, isPaid: !s.isPaid } : s,
        ),
      );
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
    setPayTarget(null);
  }, [payTarget, selectedIntake]);

  const listConfig: EntityListConfig<Intake> = {
    columns: [
      { key: "code", header: "Code", sortable: true },
      { key: "majorName", header: "Major" },
      { key: "year", header: "Year" },
      {
        key: "startDate",
        header: "Start Date",
        render: (i) => (
          <span>{new Date(i.startDate).toLocaleDateString()}</span>
        ),
      },
      { key: "currentStatus", header: "Current Semester" },
    ],
    searchFields: ["code", "majorName"],
    itemsPerPage: 10,
    onRowClick: (intake) => handleRowClick(intake.id),
  };

  return (
    <div className="space-y-4">
      {!detailMode ? (
        <>
          <h1 className="text-xl font-semibold text-foreground mb-6">
            All Intakes ({intakes.length})
          </h1>

          <EntityList
            config={listConfig}
            data={intakes}
            isLoading={isLoading}
            searchPlaceholder="Search by code or major..."
          />
        </>
      ) : (
        <>
          <Card className="w-full shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center mb-6 justify-between">
                <span className="text-xl font-bold">
                  {selectedIntake?.majorName} - {selectedIntake?.code || ""} (
                  {selectedIntake?.currentStatus})
                </span>
                <span
                  className="text-xs bg-primary/10 rounded-md hover:bg-primary/80 hover:text-white py-1 px-2 cursor-pointer"
                  onClick={() => {
                    setDetailMode(false);
                    setSelectedIntake(undefined);
                  }}
                >
                  Back
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold border-b pb-1">
                  Semester Schedules
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedIntake &&
                    selectedIntake.semester_schedules &&
                    selectedIntake.semester_schedules.length > 0 &&
                    selectedIntake.semester_schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`justify-between items-center py-2 px-4 rounded-md border text-sm ${
                          schedule.semester_id === selectedIntake.currentSemId
                            ? "bg-primary/5 border-success"
                            : "bg-background"
                        }`}
                      >
                        <span className="font-mono text-xs">
                          {schedule.year} - {schedule.semester_name}
                        </span>
                        <div className="flex gap-5">
                          <span className="text-muted-foreground">
                            Start Date: {schedule.start_date}
                          </span>
                          <span className="text-muted-foreground">
                            End Date: {schedule.end_date}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex gap-5 items-center justify-between">
                Students ({students.length})
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">
                        Full Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Student Phone
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Parent Phone
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-border hover:bg-muted/50 select-none"
                        >
                          <td className="py-3 px-4 font-medium">
                            {s.fullName}
                          </td>
                          <td className="py-3 px-4">{s.studentPhoneNo}</td>
                          <td className="py-3 px-4">{s.parentPhoneNo}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                s.isPaid
                                  ? "bg-success/20 text-success border-success/30"
                                  : "bg-destructive/20 text-destructive border-destructive/30"
                              }`}
                            >
                              <span
                                className={`mr-1.5 h-2 w-2 rounded-full ${s.isPaid ? "bg-success" : "bg-destructive"}`}
                              />
                              {s.isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-success hover:bg-success/80"
                              onClick={() => setPayTarget(s)}
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-muted-foreground"
                        >
                          No Students in this intake.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog
        open={!!payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Fully Paid?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that student &ldquo;{payTarget?.fullName}&rdquo; has
              cleared all outstanding balances for this intake.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayment}>
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
