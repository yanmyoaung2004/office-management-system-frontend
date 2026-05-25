"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { apiGet } from "@/lib/api-client";
import { toast } from "sonner";
import { generateAndDownloadResult } from "@/lib/generateResultExcel";
import { generateAndDownloadProgressResult, type ProgressDepartment } from "@/lib/DocumentGenerator";
import { generateAndDownloadProgressResultExcel } from "@/lib/generateProgressResultExcel";
import { SubjectFrequencies } from "@/components/exam/subject-frequencies";
import { TimetableView } from "@/components/exam/timetable-view";
import type { DropoutStudent, Intake, Major, Year } from "@/types";

const ITEMS_PER_PAGE = 6;

interface IntakeDetailProps {
  intakeId: string;
  selectedIntake: Intake | undefined;
  majors: Major[];
  years: Year[];
  onBack: () => void;
}

export function IntakeDetail({
  intakeId,
  selectedIntake,
  majors,
  years,
  onBack,
}: IntakeDetailProps) {
  const [students, setStudents] = useState<DropoutStudent[]>([]);
  const [selectedYearStr, setSelectedYearStr] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [isGeneratingProgress, setIsGeneratingProgress] = useState(false);
  const [isGeneratingProgressExcel, setIsGeneratingProgressExcel] = useState(false);
  const [schedulingSemesterId, setSchedulingSemesterId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const schedulingMeta = useMemo(() => {
    if (!schedulingSemesterId) return null;
    for (const y of years) {
      for (const s of y.semesters ?? []) {
        if (s.id === schedulingSemesterId) {
          const major = majors.find((m) => m.id === selectedIntake?.majorId);
          return {
            majorName: major?.name ?? "",
            yearName: y.name,
            semesterName: s.name,
          };
        }
      }
    }
    return null;
  }, [schedulingSemesterId, years, majors, selectedIntake]);

  const handleViewIntakeDetails = useCallback(async () => {
    setStudents(
      (await apiGet(
        `/admission/intakes/${intakeId}/enrollments`,
      )) as DropoutStudent[],
    );
    setSelectedYearStr("");
  }, [intakeId]);

  const handleGenerateYearResult = useCallback(async () => {
    if (!selectedYearStr) return;
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
      }>(`/exam/intakes/${intakeId}/year-results/${yearNumber}/`);

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
  }, [intakeId, selectedYearStr]);

  const handleGenerateProgressResult = useCallback(async () => {
    if (!selectedSemesterId) return;
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
      }>(`/exam/intakes/${intakeId}/semesters/${selectedSemesterId}/progress-result/`);

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
  }, [intakeId, selectedSemesterId]);

  const handleGenerateProgressResultExcel = useCallback(async () => {
    if (!selectedSemesterId) return;
    setIsGeneratingProgressExcel(true);
    try {
      const res = await apiGet<{
        campus: string;
        program: string;
        intake: string;
        courses: { name: string; code: string }[];
        students: { id: string; name: string; scores: number[] }[];
      }>(`/exam/intakes/${intakeId}/semesters/${selectedSemesterId}/progress-result-excel/`);

      await generateAndDownloadProgressResultExcel(
        {
          campus: res.campus,
          program: res.program,
          intake: res.intake,
          courses: res.courses,
          students: res.students,
        },
        `Progress_Result_${res.intake.replace(/\s+/g, "_")}.xlsx`,
      );
      toast.success("Progress result Excel downloaded");
    } catch (err) {
      console.error("Progress result Excel error:", err);
      toast.error("Failed to generate progress result Excel");
    } finally {
      setIsGeneratingProgressExcel(false);
    }
  }, [intakeId, selectedSemesterId]);

  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalPagesStudent = Math.ceil(students.length / ITEMS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-5 items-center justify-between">
          Students ({students.length})
          <span
            className="text-xs bg-primary/10 rounded-md hover:bg-primary/80 hover:text-primary-foreground py-1 px-2 cursor-pointer"
            onClick={onBack}
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
                  value={y.type === "FOUNDATION" ? "1" : String(y.yearNumber)}
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
              {isGeneratingProgress ? "Generating..." : "Generate Word"}
            </Button>
            <Button
              onClick={handleGenerateProgressResultExcel}
              disabled={isGeneratingProgressExcel || !selectedSemesterId}
              variant="outline"
              className="gap-2"
            >
              {isGeneratingProgressExcel ? "Generating..." : "Generate Excel"}
            </Button>
          </div>
        </div>

        <div className="mb-4 p-4 border rounded-lg bg-muted/20">
          <h3 className="text-sm font-semibold mb-2">Class Scheduling</h3>
          <div className="flex gap-2 items-center mb-4">
            <select
              value={schedulingSemesterId}
              onChange={(e) => setSchedulingSemesterId(e.target.value)}
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
          </div>
          {schedulingSemesterId && (
            <div className="space-y-4">
              <div className="border border-border rounded-md p-4 bg-card">
                <h4 className="text-sm font-semibold mb-3">
                  Subject Frequencies
                </h4>
                <SubjectFrequencies
                  intakeId={intakeId}
                  semesterId={schedulingSemesterId}
                  majorName={schedulingMeta?.majorName}
                  yearName={schedulingMeta?.yearName}
                  semesterName={schedulingMeta?.semesterName}
                />
              </div>
              <div className="border border-border rounded-md p-4 bg-card">
                <h4 className="text-sm font-semibold mb-3">Timetable</h4>
                <TimetableView
                  intakeId={intakeId}
                  semesterId={schedulingSemesterId}
                />
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleViewIntakeDetails} className="mb-4 gap-2">
          Load Students
        </Button>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Phone</th>
                <th className="text-left py-3 px-4 font-semibold">Enrolled Date</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-4 font-medium">{s.fullName}</td>
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
                                  ? "bg-warning/20 text-warning"
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
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No Students loaded. Click &ldquo;Load Students&ldquo; above.
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
  );
}
