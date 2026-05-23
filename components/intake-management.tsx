"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import type {
  DropoutStudent,
  Intake,
  Major,
  Year,
  IntakeSemester,
  ScheduleState,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Download, Edit, Plus, Trash2, X } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { ConfirmationPopup } from "./confirmation-popup";
import { apiGet } from "@/lib/api-client";
import { filterIntakes, searchIntakes } from "@/lib/search-utils";
import { toast } from "sonner";
import { generateAndDownloadResult } from "@/lib/generateResultExcel";
import {
  generateAndDownloadProgressResult,
  type ProgressDepartment,
} from "@/lib/DocumentGenerator";

const ITEMS_PER_PAGE = 6;

interface IntakeManagementProps {
  intakes: Intake[];
  majors: Major[];
  onAddIntake: (intake: Omit<Intake, "id">) => void;
  onUpdateIntake: (intake: Intake) => void;
  onDeleteIntake: (intakeId: string) => void;
}

export function IntakeManagement({
  intakes,
  majors,
  onAddIntake,
  onUpdateIntake,
  onDeleteIntake,
}: IntakeManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState<boolean>(false);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<boolean>(false);
  const [years, setYears] = useState<Year[]>([]);
  const [students, setStudents] = useState<DropoutStudent[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleState>({});
  const [selectedYearStr, setSelectedYearStr] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [isGeneratingProgress, setIsGeneratingProgress] = useState(false);
  const [formData, setFormData] = useState<Intake>({
    id: "",
    code: "",
    majorId: "",
    majorName: "",
    currentSemId: "",
    year: new Date().getFullYear(),
    capacity: 20,
    startDate: "",
    endDate: null,
    currentStatus: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [filters, setFilters] = useState({
    major: "",
  });

  const handleSelectMajor = (majorId: string) => {
    setYears(majors.find((m) => m.id === majorId)?.years ?? []);
  };

  const handleDateChange = (
    semesterId: string,
    field: keyof Omit<IntakeSemester, "semester_id">,
    value: string,
  ) => {
    setScheduleData((prev) => {
      const prevSemester = prev[semesterId] || {
        id: null,
        semester_id: semesterId,
        start_date: "",
        end_date: "",
      };
      return {
        ...prev,
        [semesterId]: {
          ...prevSemester,
          [field]: value,
          semester_id: semesterId,
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.code &&
      formData.majorId &&
      formData.startDate &&
      formData.year
    ) {
      if (showFormEdit) {
        onUpdateIntake({
          id: formData.id,
          code: formData.code,
          majorId: formData.majorId,
          currentSemId: formData.currentSemId,
          year: formData.year,
          capacity: formData.capacity,
          startDate: formData.startDate,
          endDate: formData.endDate,
          majorName: formData.majorName,
          currentStatus: formData.currentStatus,
          semester_schedules: Object.values(scheduleData),
        });
        setShowFormEdit(false);
      } else {
        onAddIntake({
          code: formData.code,
          majorId: formData.majorId,
          currentSemId: formData.currentSemId,
          year: formData.year,
          capacity: formData.capacity,
          startDate: formData.startDate,
          endDate: formData.endDate,
          majorName: formData.majorName,
          currentStatus: formData.currentStatus,
          semester_schedules: Object.values(scheduleData),
        });
        setShowForm(false);
      }
      setFormData({
        id: "",
        code: "",
        majorId: "",
        majorName: "",
        currentSemId: "",
        year: new Date().getFullYear(),
        capacity: 20,
        startDate: "",
        endDate: null,
        currentStatus: "",
      });
      setScheduleData({});
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const handleViewIntakeDetails = useCallback(
    async (intakeId: string) => {
      const intake = intakes.find((i) => i.id === intakeId);
      setStudents(
        (await apiGet(
          `/admission/intakes/${intakeId}/enrollments`,
        )) as DropoutStudent[],
      );
      if (intake) {
        setYears(majors.find((m) => m.id === intake.majorId)?.years ?? []);
      }
      setSelectedYearStr("");
      setDetailMode(true);
      setSelectedIntakeId(intakeId);
    },
    [intakes, majors],
  );

  const handleIntakeExportCSV = () => {
    const headers = [
      "No",
      "Intake Code",
      "Major",
      "Year",
      "Start Date",
      "Current Semester",
    ];

    const rows = intakes.map((s, idx) => [
      idx + 1,
      s.code,
      s.majorName,
      s.year,
      s.startDate,
      s.currentStatus,
    ]);
    const fileName = `intakes-${new Date().toISOString().split("T")[0]}.csv`;
    handleExportCSV(headers, rows, fileName);
  };

  const handleStudentIntakeExportCSV = () => {
    const headers = ["No", "Name", "Email", "Phone", "Enrolled Date", "Status"];

    const rows = students.map((s, idx) => [
      idx + 1,
      s.fullName,
      s.email,
      s.studentPhone,
      s.enrolledDate,
      s.status,
    ]);
    const fileName = `intake-${selectedIntakeId}-${new Date().toISOString().split("T")[0]}.csv`;
    handleExportCSV(headers, rows, fileName);
  };

  const handleExportCSVForStudentsIntakes = () => {
    if (selectedIntakeId) {
      handleStudentIntakeExportCSV();
    } else {
      handleIntakeExportCSV();
    }
  };

  const handleExportCSV = (
    headers: string[],
    rows: (string | number)[][],
    fileName: string,
  ) => {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };
  const activeFilters = Object.values(filters).filter((f) => f !== "").length;

  let filteredIntakes = searchIntakes(intakes, searchQuery);

  filteredIntakes = filterIntakes(filteredIntakes, {
    major: filters.major || undefined,
  });

  const totalPages = Math.ceil(filteredIntakes.length / ITEMS_PER_PAGE);
  const paginatedIntakes = filteredIntakes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalPagesStudent = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleGenerateYearResult = useCallback(async () => {
    if (!selectedIntakeId || !selectedYearStr) return;
    setIsGenerating(true);
    try {
      const yearNumber = Number(selectedYearStr);
      const res = await apiGet<{
        success: boolean;
        data: {
          intake: { code: string; major_name: string };
          year: { name: string; yearNumber: number; type: string };
          semesters: {
            semester_number: number;
            name: string;
            subjects: { name: string; code: string }[];
          }[];
          students: {
            no: number;
            rollNo: number;
            studentId: string;
            name: string;
            s1Marks: Record<string, number>;
            s2Marks: Record<string, number>;
          }[];
        };
      }>(`/exam/intakes/${selectedIntakeId}/year-results/${yearNumber}/`);

      const data = res.data;

      const s1Subjects = data.semesters[0]?.subjects ?? [];
      const s2Subjects = data.semesters[1]?.subjects ?? [];

      await generateAndDownloadResult(
        {
          sheetName: `${data.intake.code} - ${data.year.name}`,
          collegeName: "STI Myanmar University",
          programName: data.intake.major_name,
          intake: `${data.intake.code} - ${data.intake.major_name} - ${data.year.name}`,
          s1Subjects,
          s2Subjects,
          students: data.students.map((s) => ({
            no: s.no,
            rollNo: s.rollNo,
            studentId: s.studentId,
            name: s.name,
            s1Marks: s.s1Marks,
            s2Marks: s.s2Marks,
          })),
        },
        `${data.intake.code}_${data.year.name.replace(/\s+/g, "_")}_Result.xlsx`,
      );
      toast.success("Year-end result downloaded successfully");
    } catch (err) {
      console.error("Year result error:", err);
      toast.error("Failed to generate year-end result");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedIntakeId, selectedYearStr]);

  const handleGenerateProgressResult = useCallback(async () => {
    if (!selectedIntakeId || !selectedSemesterId) return;
    setIsGeneratingProgress(true);
    try {
      const res = await apiGet<{
        success: boolean;
        data: {
          departments: ProgressDepartment[];
          remark_subjects: string[];
          signatory_name: string;
          signatory_title: string;
          signatory_date: string;
          signatory_college: string;
          college_name: string;
          faculty: string;
          program: string;
          intake: string;
          date: string;
        };
      }>(
        `/exam/intakes/${selectedIntakeId}/semesters/${selectedSemesterId}/progress-result/`,
      );

      const data = res.data;
      await generateAndDownloadProgressResult(
        {
          college_name: data.college_name,
          faculty: data.faculty,
          program: data.program,
          intake: data.intake,
          date: data.date,
          departments: data.departments,
          remark_subjects: data.remark_subjects,
          signatory_name: data.signatory_name,
          signatory_title: data.signatory_title,
          signatory_date: data.signatory_date,
          signatory_college: data.signatory_college,
        },
        `Progress_Result_${data.intake.replace(/\s+/g, "_")}.docx`,
      );

      toast.success("Progress result downloaded");
    } catch (err) {
      console.error("Progress result error:", err);
      toast.error("Failed to generate progress result");
    } finally {
      setIsGeneratingProgress(false);
    }
  }, [selectedIntakeId, selectedSemesterId]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Intake
          </Button>
          <Input
            placeholder="Search by intake code, major name, year, status, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setExpandedFilters(!expandedFilters)}
            variant="outline"
            className="gap-2 bg-white flex-1"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedFilters ? "rotate-180" : ""}`}
            />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>
          <Button
            onClick={handleExportCSVForStudentsIntakes}
            variant="outline"
            className="gap-2 bg-white flex-1"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      {expandedFilters && (
        <Card className="bg-muted/50 border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Major</label>
                <select
                  value={filters.major}
                  onChange={(e) =>
                    setFilters({ ...filters, major: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">All Majors</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeFilters > 0 && (
              <Button
                onClick={() =>
                  setFilters({
                    major: "",
                  })
                }
                variant="ghost"
                size="sm"
                className="mt-4 gap-1 hover:bg-primary/80"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {(showForm || showFormEdit) && (
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-xl font-semibold mb-4">New Intake</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Intake Code
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., CS1, PH1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Year</label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: Number.parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Major</label>
                <select
                  value={formData.majorId}
                  onChange={(e) => {
                    setFormData({ ...formData, majorId: e.target.value });
                    handleSelectMajor(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Select Major</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Current Semester
                </label>
                <select
                  value={formData.currentSemId || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      currentSemId: selectedId,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Select Semester</option>
                  {years?.map((y) => (
                    <optgroup key={y.id} label={y.name}>
                      {y.semesters?.map((s) => (
                        <option key={s.id} value={s.id ? s.id : ""}>
                          {`${y.name} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Capacity
                </label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="e.g., CS1, PH1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value,
                    })
                  }
                  required
                  className="h-8 text-sm"
                />
              </div>

              {years.length > 0 && (
                <div className="space-y-6 col-span-2">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Schedule Configuration
                  </h3>

                  {years.map((y) => (
                    <div
                      key={y.id}
                      className="p-4 border rounded-lg bg-slate-50/50"
                    >
                      <h4 className="text-md font-bold  mb-4 uppercase tracking-wide">
                        {y.name}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {y.semesters.map((s) => (
                          <div
                            key={s.id ?? `semester-${Math.random()}`}
                            className="bg-white p-3 rounded border shadow-sm"
                          >
                            <p className="text-sm font-semibold mb-3 border-l-4 border-primary/90 pl-2">
                              {s.name}
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                <label className="text-xs font-medium text-gray-500 w-20">
                                  Start Date
                                </label>
                                <Input
                                  type="date"
                                  value={
                                    s.id != null
                                      ? scheduleData[s.id]?.start_date || ""
                                      : ""
                                  }
                                  onChange={(e) =>
                                    s.id != null &&
                                    handleDateChange(
                                      s.id,
                                      "start_date",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>

                              <div className="flex items-center gap-4">
                                <label className="text-xs font-medium text-gray-500 w-20">
                                  End Date
                                </label>
                                <Input
                                  type="date"
                                  value={
                                    s.id != null
                                      ? scheduleData[s.id]?.end_date || ""
                                      : ""
                                  }
                                  onChange={(e) =>
                                    s.id != null &&
                                    handleDateChange(
                                      s.id,
                                      "end_date",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {showFormEdit ? "Update Intake" : "Create Intake"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setScheduleData({});
                  setShowForm(false);
                  setShowFormEdit(false);
                  setYears([]);
                  setFormData({
                    id: "",
                    code: "",
                    majorId: "",
                    majorName: "",
                    currentSemId: "",
                    year: new Date().getFullYear(),
                    capacity: 20,
                    startDate: "",
                    endDate: null,
                    currentStatus: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {!detailMode ? (
          <>
            <CardHeader>
              <CardTitle>All Intakes ({intakes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">
                        Code
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Major
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Year
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Start Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Current Semester
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Actions
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
                          <td className="py-3 px-4 font-medium">
                            {intake.code}
                          </td>
                          <td className="py-3 px-4">{intake.majorName}</td>
                          <td className="py-3 px-4">{intake.year}</td>
                          <td className="py-3 px-4">{intake.startDate}</td>
                          <td className="py-3 px-4">{intake.currentStatus}</td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => {
                                setShowFormEdit(true);
                                setFormData(intake);
                                const initialState =
                                  intake.semester_schedules &&
                                  intake.semester_schedules.reduce(
                                    (acc, current) => {
                                      acc[current.semester_id] = current;
                                      return acc;
                                    },
                                    {} as Record<string, IntakeSemester>,
                                  );
                                setScheduleData(
                                  initialState ? initialState : {},
                                );

                                setYears(
                                  majors.find((m) => m.id === intake.majorId)
                                    ?.years ?? [],
                                );
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/80"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <ConfirmationPopup
                              itemId={intake.id}
                              onAllow={onDeleteIntake}
                              onCancel={() => {}}
                              onButtonText=""
                              onButtonVariant="ghost"
                              onAllowButtonText="Allow"
                              onCancelButtonText="Don't allow"
                              primaryText="Allow to delete?"
                              description="Do you want to allow this intake to be deleted permanently?"
                              buttonIcon={Trash2}
                              buttonClass={
                                "text-destructive hover:bg-destructive/80"
                              }
                              iconClass="h-4 w-4"
                            />
                          </td>
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
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="flex gap-5 items-center justify-between">
                Students ({students.length})
                <span
                  className="text-xs bg-primary/10 rounded-md hover:bg-primary/80 hover:text-white py-1 px-2 cursor-pointer"
                  onClick={() => {
                    setDetailMode(false);
                    setSelectedIntakeId(null);
                  }}
                >
                  Back
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-4 p-4 border rounded-lg bg-muted/20">
                <h3 className="text-sm font-semibold mb-2">
                  Year-End Result Generation
                </h3>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedYearStr}
                    onChange={(e) => setSelectedYearStr(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  >
                    <option value="">Select Year...</option>
                    {years.map((y) => (
                      <option
                        key={y.id}
                        value={
                          y.type === "FOUNDATION" ? "1" : String(y.yearNumber)
                        }
                      >
                        {y.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={handleGenerateYearResult}
                    disabled={isGenerating || !selectedYearStr}
                    className="gap-2"
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>

              <div className="mb-4 p-4 border rounded-lg bg-muted/20">
                <h3 className="text-sm font-semibold mb-2">
                  Semester Progress Result Generation
                </h3>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  >
                    <option value="">Select Semester...</option>
                    {years.flatMap((y) =>
                      (y.semesters ?? []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {y.name} - {s.name}
                        </option>
                      )),
                    )}
                  </select>
                  <Button
                    onClick={handleGenerateProgressResult}
                    disabled={isGeneratingProgress || !selectedSemesterId}
                    className="gap-2"
                  >
                    {isGeneratingProgress ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Enrolled Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.length > 0 ? (
                      paginatedStudents.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-border hover:bg-muted/50 select-none"
                        >
                          <td className="py-3 px-4 font-medium">
                            {s.fullName}
                          </td>
                          <td className="py-3 px-4">{s.email}</td>
                          <td className="py-3 px-4">{s.studentPhone}</td>
                          <td className="py-3 px-4">{s.enrolledDate}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                s.status === "Enrolled"
                                  ? "bg-accent/20 text-accent"
                                  : s.status === "Graduated"
                                    ? "bg-emerald-600/20 text-emerald-600"
                                    : s.status === "Dropout"
                                      ? "bg-destructive/20 text-destructive"
                                      : s.status === "Interrupted"
                                        ? "bg-yellow-400/20 text-yellow-600"
                                        : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {s.status}
                            </span>
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
          </>
        )}
      </Card>
    </div>
  );
}
