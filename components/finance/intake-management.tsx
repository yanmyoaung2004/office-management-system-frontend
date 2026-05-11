"use client";
import { useCallback, useRef, useState } from "react";
import type { Intake } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/pagination";
import { searchIntakes } from "@/lib/search-utils";
import { apiGet, apiPost } from "@/lib/api-client";
import { ConfirmationPopup } from "../confirmation-popup";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { usePermission } from "@/hooks/usePermission";

const ITEMS_PER_PAGE = 6;

interface IntakeManagementProps {
  intakes: Intake[];
}

interface FinanceStudent {
  id: string;
  isPaid: boolean;
  studentId: string;
  fullName: string;
  studentPhoneNo: string;
  parentPhoneNo: string;
}

interface FinanceStudentResponse {
  data: FinanceStudent[];
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function FinanceIntakeManagement({ intakes }: IntakeManagementProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIntake, setSelectedIntake] = useState<Intake>();
  const [detailMode, setDetailMode] = useState<boolean>(false);
  const [students, setStudents] = useState<FinanceStudent[]>([]);
  const { hasPermission } = usePermission();

  const filteredIntakes = searchIntakes(intakes, searchQuery);

  const totalPages = Math.ceil(filteredIntakes.length / ITEMS_PER_PAGE);
  const paginatedIntakes = filteredIntakes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalPagesStudent = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents =
    students.length > 0 &&
    students.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

  const handleViewIntakeDetails = useCallback(
    async (intakeId: string) => {
      if (!hasPermission("view_enrollment")) {
        toast.error("You don't have permission.");
        return;
      }
      const res: FinanceStudentResponse = await apiGet(
        `/finance/intakes/${intakeId}/enrollments`,
      );
      console.log(res.data);

      const intake = intakes.find((i) => i.id === intakeId);
      if (intake) {
        setSelectedIntake(intake);
      }

      setStudents(res.data);
      setDetailMode(true);
    },
    [intakes, hasPermission, setSelectedIntake, setStudents, setDetailMode],
  );

  const lastClickRef = useRef<number>(0);

  const handleDoubleClickFallback = useCallback(
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

  const updatePaymentStatus = async (id: string) => {
    const res: { success: boolean; message: string; error: string } =
      await apiPost(`/finance/fee/`, {
        enrollment_id: id,
        semester_id: selectedIntake?.currentSemId,
      });
    const { success, message, error } = res;
    if (success) {
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === id ? { ...student, isPaid: !student.isPaid } : student,
        ),
      );
      toast.error(message);
      return;
    }
    toast.error(error);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search by name, code, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white text-sm"
          />
        </div>
      </div>

      {!detailMode ? (
        <Card>
          <CardHeader>
            <CardTitle>All Intakes ({intakes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Code</th>
                    <th className="text-left py-3 px-4 font-semibold">Major</th>
                    <th className="text-left py-3 px-4 font-semibold">Year</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Start Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Current Semester
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIntakes.length > 0 ? (
                    paginatedIntakes.map((intake) => (
                      <tr
                        key={intake.id}
                        className="border-b border-border hover:bg-muted/50 select-none touch-manipulation"
                        onClick={() => {
                          handleDoubleClickFallback(intake.id);
                        }}
                      >
                        <td className="py-3 px-4 font-medium">{intake.code}</td>
                        <td className="py-3 px-4">{intake.majorName}</td>
                        <td className="py-3 px-4">{intake.year}</td>
                        <td className="py-3 px-4">{intake.startDate}</td>
                        <td className="py-3 px-4">{intake.currentStatus}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No intakes created
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-6 border-t border-border pt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="w-full shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center  mb-6 justify-between">
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
                    selectedIntake.semester_schedules !== undefined &&
                    selectedIntake?.semester_schedules?.length > 0 &&
                    selectedIntake.semester_schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`justify-between items-center py-2 px-4  rounded-md border text-sm ${
                          schedule.semester_id === selectedIntake.currentSemId
                            ? "bg-primary/5 border-green-800"
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
                    {paginatedStudents && paginatedStudents.length > 0 ? (
                      paginatedStudents.map((s) => (
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
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              <span
                                className={`mr-1.5 h-2 w-2 rounded-full ${s.isPaid ? "bg-green-600" : "bg-red-600"}`}
                              ></span>
                              {s.isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <ConfirmationPopup
                              itemId={s.id}
                              onAllow={updatePaymentStatus}
                              onCancel={() => {}}
                              onButtonText=""
                              onButtonVariant="ghost"
                              onAllowButtonText="Confirm Payment"
                              onCancelButtonText="Cancel"
                              primaryText="Mark as Fully Paid?"
                              description={`Confirm that student ${s.fullName} has cleared all outstanding balances for this intake.`}
                              buttonIcon={CheckCircle2}
                              buttonClass={"text-green-600 hover:bg-green-500"}
                              iconClass="h-5 w-5"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-muted-foreground"
                        >
                          No Students in this intake.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPagesStudent > 1 && (
                <div className="mt-6 border-t border-border pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPagesStudent}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
