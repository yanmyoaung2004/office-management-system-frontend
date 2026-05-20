"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Calendar, Clock, BookOpen, Layout } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExamPaper,
  ExamSchedule,
  ExamType,
  Intake,
  IntakeSemester,
} from "@/types";
import { apiPost, apiPut } from "@/lib/api-client";
import { toast } from "sonner";
import { usePermission } from "@/hooks/usePermission";

// ======================================================
// TYPES
// ======================================================

interface ExamFormData {
  title: string;
  intake_id: string;
  semester_id: string;
  date_started: string;
  papers: ExamPaper[];
}

interface ExamFormProps {
  intakes: Intake[];
  onClose: () => void;
  exam: ExamSchedule | null | undefined;
  isUpdate: boolean;
}

// ======================================================
// COMPONENT
// ======================================================

export default function ExamForm({
  intakes,
  onClose,
  exam,
  isUpdate,
}: ExamFormProps) {
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermission();

  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(
    intakes.find((i) => i.id === exam?.intake) ?? null,
  );
  const [selectedSemester, setSelectedSemester] =
    useState<IntakeSemester | null>(() => {
      return (
        selectedIntake?.semester_schedules?.find(
          (s) => s.semester_id === exam?.semester,
        ) ?? null
      );
    });

  const [formData, setFormData] = useState<ExamFormData>({
    title: exam ? exam?.title : "Final Exam 2026",
    intake_id: exam ? exam?.intake : "",
    semester_id: exam ? exam?.semester : "",
    date_started: exam ? exam?.date_started : "",
    papers: exam ? exam?.papers : [],
  });

  // ======================================================
  // MEMOIZED SUBJECTS
  // ======================================================

  const subjects = useMemo(() => {
    return selectedSemester?.subjects || [];
  }, [selectedSemester]);

  // ======================================================
  // HELPERS
  // ======================================================

  const updateBaseField = <K extends keyof Omit<ExamFormData, "papers">>(
    field: K,
    value: ExamFormData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePaper = <K extends keyof ExamPaper>(
    index: number,
    field: K,
    value: ExamPaper[K],
  ) => {
    const updated = [...formData.papers];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      papers: updated,
    }));
  };

  const addPaper = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);

    if (!subject) return;

    const exists = formData.papers.some(
      (paper) => paper.subject === subject.id,
    );

    if (exists) {
      toast.error("Paper already exists for this subject.");

      return;
    }

    const newPaper: ExamPaper = {
      subject: subject.id,
      total_marks: 100,
      exam_date: `${formData.date_started}T09:00`,
      type: "ONPAPER",
      duration: "03:00:00",
    };

    setFormData((prev) => ({
      ...prev,
      papers: [...prev.papers, newPaper],
    }));
  };

  const removePaper = (index: number) => {
    const updated = formData.papers.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      papers: updated,
    }));
  };

  const getSubjectName = (id: string) => {
    return subjects.find((s) => s.id === id)?.name || id;
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.intake_id) {
        throw new Error("Please select intake.");
      }

      if (!formData.semester_id) {
        throw new Error("Please select semester.");
      }
      if (!formData.date_started) {
        throw new Error("Please select exam date.");
      }

      if (formData.papers.length === 0) {
        throw new Error("At least one paper is required.");
      }
      if (!isUpdate) {
        if (!hasPermission("add_exam")) {
          toast.error("You don't have permission.");
          return;
        }

        const payload = {
          title: formData.title,
          semester: formData.semester_id,
          date_started: formData.date_started,
          intake: formData.intake_id,
          papers: formData.papers,
        };

        const res: { success: boolean; message: string; error: string } =
          await apiPost(`/exam/exams/`, payload);
        if (res.success) {
          toast.success(res.message);
          onClose();
          return;
        }
        toast.error(res.error);
      } else {
        if (!hasPermission("change_exam")) {
          toast.error("You don't have permission.");
          return;
        }
        const payload = {
          id: exam?.id,
          title: formData.title,
          semester: formData.semester_id,
          date_started: formData.date_started,
          intake: formData.intake_id,
          papers: formData.papers,
        };

        console.log(payload);
        const res: { success: boolean; message: string; error: string } =
          await apiPut(`/exam/exams/${exam?.id}`, payload);
        if (res.success) {
          toast.success(res.message);
          onClose();
          return;
        }
        toast.error(res.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12">
      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <Card className="lg:col-span-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Exam Configuration
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* ====================================================== */}
          {/* TOP */}
          {/* ====================================================== */}

          <div className="grid gap-6 md:grid-cols-2">
            {/* TITLE */}
            <div className="space-y-2">
              <Label>Exam Title</Label>

              <Input
                value={formData.title}
                onChange={(e) => updateBaseField("title", e.target.value)}
              />
            </div>

            {/* INTAKE */}
            <div className="space-y-2 w-full">
              <Label>Target Intake</Label>

              <Select
                value={formData.intake_id}
                onValueChange={(value) => {
                  const intake = intakes.find((i) => i.id === value) || null;

                  setSelectedIntake(intake);

                  setSelectedSemester(null);

                  setFormData((prev) => ({
                    ...prev,
                    intake_id: value,
                    semester_id: "",
                    papers: [],
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select intake" />
                </SelectTrigger>

                <SelectContent>
                  {intakes.map((intake) => (
                    <SelectItem key={intake.id} value={intake.id}>
                      {intake.majorName} - {intake.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SEMESTER */}
            <div className="space-y-2">
              <Label>Target Semester</Label>

              <Select
                value={formData.semester_id}
                onValueChange={(value) => {
                  const semester =
                    (selectedIntake &&
                      selectedIntake?.semester_schedules &&
                      selectedIntake?.semester_schedules.find(
                        (s) => s.semester_id === value,
                      )) ||
                    null;

                  setSelectedSemester(semester);

                  setFormData((prev) => ({
                    ...prev,
                    semester_id: value,
                    papers: [],
                  }));
                }}
                disabled={!selectedIntake}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>

                <SelectContent>
                  {selectedIntake &&
                    selectedIntake?.semester_schedules &&
                    selectedIntake?.semester_schedules.map((semester) => (
                      <SelectItem
                        key={semester.semester_id}
                        value={semester.semester_id}
                      >
                        {semester.year} - {semester.semester_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* START DATE */}
            <div className="space-y-2">
              <Label>Exam Start Date</Label>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  type="date"
                  className="pl-9"
                  value={formData.date_started}
                  onChange={(e) =>
                    updateBaseField("date_started", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* STATUS */}
          {/* ====================================================== */}

          {/* ====================================================== */}
          {/* PAPERS HEADER */}
          {/* ====================================================== */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />

              <h2 className="text-lg font-semibold">Scheduled Papers</h2>
            </div>

            <Badge variant="secondary">{formData.papers.length} Papers</Badge>
          </div>

          {/* ====================================================== */}
          {/* PAPERS */}
          {/* ====================================================== */}

          <div className="space-y-6">
            {formData.papers.map((paper, index) => (
              <div
                key={index}
                className="relative space-y-6 rounded-xl border bg-muted/20 p-5"
              >
                {/* REMOVE */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-3 top-3 hover:bg-red-500 "
                  onClick={() => removePaper(index)}
                >
                  <Trash2 className="h-4 w-4 hover:text-destructive" />
                </Button>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {/* SUBJECT */}
                  <div className="space-y-2">
                    <Label>Subject</Label>

                    <Select
                      value={paper.subject}
                      onValueChange={(value) =>
                        updatePaper(index, "subject", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* MARKS */}
                  <div className="space-y-2">
                    <Label>Total Marks</Label>

                    <Input
                      type="number"
                      value={paper.total_marks}
                      onChange={(e) =>
                        updatePaper(
                          index,
                          "total_marks",
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>

                  {/* TYPE */}
                  <div className="space-y-2">
                    <Label>Format</Label>

                    <Select
                      value={paper.type}
                      onValueChange={(value) =>
                        updatePaper(index, "type", value as ExamType)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ONPAPER">On Paper</SelectItem>

                        <SelectItem value="PRESENTATION">
                          Presentation
                        </SelectItem>

                        <SelectItem value="VIVA">Viva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DURATION */}
                  <div className="space-y-2">
                    <Label>Duration</Label>

                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        className="pl-9"
                        value={paper.duration}
                        onChange={(e) =>
                          updatePaper(index, "duration", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* DATE */}
                <div className="space-y-2">
                  <Label>Exam Date</Label>

                  <div className="relative max-w-sm">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                    <Input
                      type="datetime-local"
                      className="pl-9"
                      value={
                        paper.exam_date ? paper.exam_date.slice(0, 16) : ""
                      }
                      onChange={(e) =>
                        updatePaper(index, "exam_date", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {getSubjectName(paper.subject)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>{isUpdate ? "Update Exam" : "Save Exam"}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================== */}

      <div className="space-y-6 lg:col-span-4">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Semester Subjects
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {!selectedSemester && (
              <p className="text-sm text-muted-foreground">
                Select intake and semester first.
              </p>
            )}

            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{subject.name}</p>

                  <p className="font-mono text-xs text-muted-foreground">
                    {subject.code}
                  </p>
                </div>

                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => addPaper(subject.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
