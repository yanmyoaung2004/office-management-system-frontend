"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import {
  Download,
  Share,
  Upload,
  FileSpreadsheet,
  Layers,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import { ExamPaper, ExamPaperComponent } from "@/types";
import { apiPost } from "@/lib/api-client";
import { toast } from "sonner";
import { StudentExam } from "@/app/exam/exams/[id]/page";

interface ComponentWithSubject extends ExamPaperComponent {
  subject_name?: string;
}

interface ExamDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportCSV: () => void;
  onSuccessStudentResultAdd: () => void;
  papers: ExamPaper[];
  components: ComponentWithSubject[];
  students: StudentExam[];
  examId: string;
}

type ResultMode = "component" | "subject";
type CollectionMethod = "manual" | "excel" | "link";

interface ExtractedExamResult {
  student: string;
  marks_obtained: number;
  status: string;
  remarks: string;
}

type SubjectResultPayload = {
  type: string;
  students: {
    student: string;
    marks_obtained: number;
    status?: string;
    remarks?: string;
  }[];
};

export function ExamResultCollectModal({
  open,
  onOpenChange,
  onExportCSV,
  onSuccessStudentResultAdd,
  papers,
  components,
  students,
  examId,
}: ExamDetailModalProps) {
  const scaleMark = (entered: number, allocated: number): number =>
    Math.round((entered / 100) * allocated * 100) / 100;

  const unscaleMark = (stored: number, allocated: number): string => {
    if (!allocated) return String(stored);
    return String(Math.round((stored / allocated) * 100 * 100) / 100);
  };

  const [resultMode, setResultMode] = useState<ResultMode>("component");
  const [method, setMethod] = useState<CollectionMethod>("manual");
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(
    null,
  );
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedJsonPayload, setParsedJsonPayload] = useState<
    ExtractedExamResult[] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const selectedComponent = useMemo(
    () => components.find((c) => c.id === selectedComponentId),
    [components, selectedComponentId],
  );

  const selectedSubjectPaper = useMemo(
    () => papers.find((p) => p.subject === selectedSubject),
    [papers, selectedSubject],
  );
  const subjectComponents = selectedSubjectPaper?.components || [];

  const [subjectMethod, setSubjectMethod] =
    useState<CollectionMethod>("manual");

  // key: `${studentId}-${type}`
  const [subjectMarks, setSubjectMarks] = useState<Record<string, string>>({});
  const [subjectRemarks, setSubjectRemarks] = useState<Record<string, string>>(
    {},
  );

  const subjectFileInputRef = useRef<HTMLInputElement>(null);
  const [subjectFile, setSubjectFile] = useState<File | null>(null);
  const [subjectParsedData, setSubjectParsedData] = useState<
    SubjectResultPayload[] | null
  >(null);

  const [subjectLinks, setSubjectLinks] = useState<
    { type: string; url: string }[]
  >([]);
  const [isCreatingSubjectLinks, setIsCreatingSubjectLinks] = useState(false);

  const [manualMarks, setManualMarks] = useState<Record<string, string>>({});
  const [manualRemarks, setManualRemarks] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (open && method === "manual" && selectedComponentId) {
      const marks: Record<string, string> = {};
      const remarks: Record<string, string> = {};
      for (const s of students) {
        const existing = s.examResults.find(
          (r) => r.component.id === selectedComponentId,
        );
        marks[s.id] = existing
          ? unscaleMark(existing.marksObtained, existing.component.marks_allocated)
          : "";
        remarks[s.id] = existing ? existing.remarks : "";
      }
      setManualMarks(marks);
      setManualRemarks(remarks);
    }
  }, [open, method, selectedComponentId, students]);

  const handleMajorsExportCSV = () => {
    onExportCSV();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = ["csv", "xls", "xlsx"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error(
        "Invalid file format. Please upload a .csv, .xls, or .xlsx file.",
      );
      setSelectedFile(null);
      setParsedJsonPayload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert rows to raw objects using SheetJS
        const rawRows = XLSX.utils.sheet_to_json(sheet);

        // Map headers matching your precise template column strings
        const structuredData: ExtractedExamResult[] = rawRows
          .map((row: any) => {
            // Explicitly map Excel keys to your target payload structure
            const studentId = String(row["Student ID"] || "").trim();
            const marks = row["Marks"] !== undefined ? Number(row["Marks"]) : 0;
            const remarkValue = String(row["Remark"] || "").trim();

            return {
              student: studentId,
              marks_obtained: marks,
              status: "PENDING",
              remarks: remarkValue,
            };
          })
          .filter((item) => item.student !== ""); // Skips empty lines or rows missing IDs

        if (structuredData.length === 0) {
          throw new Error(
            "No valid student records found. Check your 'Student ID' column header.",
          );
        }

        setParsedJsonPayload(structuredData);
      } catch (error: any) {
        toast.error(error.message || "Failed to parse file layout.");
        setSelectedFile(null);
        setParsedJsonPayload(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  const submitResults = async (results: ExtractedExamResult[]) => {
    if (!selectedComponentId || results.length === 0) return;

    setIsSubmitting(true);

    const allocated = selectedComponent?.marks_allocated || 0;
    const scaledResults = results.map((r) => ({
      ...r,
      marks_obtained: scaleMark(r.marks_obtained, allocated),
    }));

    const payload = {
      component: selectedComponentId,
      results: scaledResults,
    };

    try {
      const response: { success: boolean; message: string; error: string } =
        await apiPost("/exam/exam-result/", payload);

      const { success, message, error: errorMessage } = response;

      if (!success) {
        throw new Error(errorMessage);
      }

      toast.success(message);
      setSelectedFile(null);
      setParsedJsonPayload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onOpenChange(false);
      onSuccessStudentResultAdd();
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (
      !parsedJsonPayload ||
      parsedJsonPayload.length === 0 ||
      !selectedComponentId
    )
      return;
    await submitResults(parsedJsonPayload);
  };

  const handleManualSubmit = async () => {
    if (!selectedComponentId) return;

    const results: ExtractedExamResult[] = students
      .filter((s) => {
        const marks = manualMarks[s.id];
        return marks !== undefined && marks !== "";
      })
      .map((s) => ({
        student: s.studentSchoolId,
        marks_obtained: Number(manualMarks[s.id]),
        status: "PENDING",
        remarks: manualRemarks[s.id] || "",
      }));

    if (results.length === 0) {
      toast.error("Enter marks for at least one student.");
      return;
    }

    await submitResults(results);
  };

  const createLink = async () => {
    if (!selectedComponentId) return;
    setIsCreatingLink(true);
    try {
      const res: { success: boolean; data: { code: string } } = await apiPost(
        `/exam/share-links/`,
        { component: selectedComponentId },
      );
      if (res.success) {
        const fullUrl = `${window.location.origin}/share/${res.data.code}`;
        setCreatedLink(fullUrl);
        toast.success("Share link created!");
      }
    } catch {
      toast.error("Failed to create share link.");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleSubjectSubmit = async () => {
    if (!selectedSubject || !examId) return;

    const results: SubjectResultPayload[] = subjectComponents
      .map((comp) => ({
        type: comp.type,
        students: students
          .filter((s) => {
            const mark = subjectMarks[`${s.id}-${comp.type}`];
            return mark !== undefined && mark !== "";
          })
          .map((s) => ({
            student: s.studentSchoolId,
            marks_obtained: scaleMark(Number(subjectMarks[`${s.id}-${comp.type}`]), comp.marks_allocated),
            status: "PENDING",
            remarks: subjectRemarks[`${s.id}-${comp.type}`] || "",
          })),
      }))
      .filter((r) => r.students.length > 0);

    if (results.length === 0) {
      toast.error("Enter marks for at least one student.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { exam: examId, subject: selectedSubject, results };
      const res: { success: boolean; message: string; error: string } =
        await apiPost("/exam/exam-result/by-subject/", payload);

      if (!res.success) throw new Error(res.error);

      toast.success(res.message);
      onOpenChange(false);
      onSuccessStudentResultAdd();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== SUBJECT: EXCEL ====================

  const triggerSubjectFileInput = () => {
    subjectFileInputRef.current?.click();
  };

  const handleSubjectFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSubject) return;

    const allowedExtensions = ["csv", "xls", "xlsx"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error(
        "Invalid file format. Please upload a .csv, .xls, or .xlsx file.",
      );
      setSubjectFile(null);
      setSubjectParsedData(null);
      if (subjectFileInputRef.current) subjectFileInputRef.current.value = "";
      return;
    }

    setSubjectFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet) as Record<
          string,
          any
        >[];

        if (rawRows.length === 0) throw new Error("No data found in file.");

        const componentTypes = subjectComponents.map((c) => c.type);
        const knownColumns = ["Student ID", ...componentTypes, "Remarks"];

        const results: SubjectResultPayload[] = componentTypes.map((type) => ({
          type,
          students: [],
        }));

        for (const row of rawRows) {
          const studentId = String(row["Student ID"] || "").trim();
          if (!studentId) continue;
          for (let i = 0; i < componentTypes.length; i++) {
            const type = componentTypes[i];
            const rawMark = row[type];
            if (rawMark === undefined || rawMark === null || rawMark === "")
              continue;
            results[i].students.push({
              student: studentId,
              marks_obtained: Number(rawMark),
              status: "PENDING",
              remarks: String(row["Remarks"] || "").trim(),
            });
          }
        }

        const nonEmpty = results.filter((r) => r.students.length > 0);
        if (nonEmpty.length === 0) {
          throw new Error(
            "No valid student records found. Expected columns: " +
              knownColumns.join(", "),
          );
        }

        setSubjectParsedData(results);
        toast.success(
          `Parsed ${rawRows.length} student(s) across ${nonEmpty.length} component type(s).`,
        );
      } catch (error: any) {
        toast.error(error.message || "Failed to parse file.");
        setSubjectFile(null);
        setSubjectParsedData(null);
        if (subjectFileInputRef.current) subjectFileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubjectUploadSubmit = async () => {
    if (
      !subjectParsedData ||
      subjectParsedData.length === 0 ||
      !selectedSubject ||
      !examId
    )
      return;

    const nonEmpty = subjectParsedData.filter((r) => r.students.length > 0);
    if (nonEmpty.length === 0) {
      toast.error("No valid records found in uploaded file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const scaledResults = nonEmpty.map((r) => {
        const comp = subjectComponents.find((c) => c.type === r.type);
        const allocated = comp?.marks_allocated || 0;
        return {
          ...r,
          students: r.students.map((s) => ({
            ...s,
            marks_obtained: scaleMark(s.marks_obtained, allocated),
          })),
        };
      });
      const payload = {
        exam: examId,
        subject: selectedSubject,
        results: scaledResults,
      };
      const res: { success: boolean; message: string; error: string } =
        await apiPost("/exam/exam-result/by-subject/", payload);

      if (!res.success) throw new Error(res.error);

      toast.success(res.message);
      setSubjectFile(null);
      setSubjectParsedData(null);
      if (subjectFileInputRef.current) subjectFileInputRef.current.value = "";
      onOpenChange(false);
      onSuccessStudentResultAdd();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubjectExportCSV = () => {
    const componentTypes = subjectComponents.map((c) => c.type);
    const headers = ["Student ID", ...componentTypes, "Remarks"];
    const rows: string[][] = students.map((s) => [
      s.studentSchoolId,
      ...componentTypes.map(() => ""),
      "",
    ]);
    const csvRows = [headers.join(","), ...rows.map((r) => r.join(","))];
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subject-template-${selectedSubjectPaper?.subject_name || "subject"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== SUBJECT: SHARE LINK ====================

  const handleSubjectCreateLinks = async () => {
    if (!selectedSubject || subjectComponents.length === 0) return;
    setIsCreatingSubjectLinks(true);
    try {
      const links: { type: string; url: string }[] = [];
      for (const comp of subjectComponents) {
        if (!comp.id) continue;
        const res: { success: boolean; data: { code: string } } = await apiPost(
          `/exam/share-links/`,
          { component: comp.id },
        );
        if (res.success) {
          links.push({
            type: comp.type,
            url: `${window.location.origin}/share/${res.data.code}`,
          });
        }
      }
      setSubjectLinks(links);
      if (links.length > 0) {
        toast.success(`Created ${links.length} share link(s).`);
      } else {
        toast.error("Failed to create any share links.");
      }
    } catch {
      toast.error("Failed to create share links.");
    } finally {
      setIsCreatingSubjectLinks(false);
    }
  };

  const copySubjectLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const copyAllSubjectLinks = async () => {
    if (subjectLinks.length === 0) return;
    try {
      const text = subjectLinks.map((l) => `${l.type}: ${l.url}`).join("\n");
      await navigator.clipboard.writeText(text);
      toast.success("All links copied to clipboard!");
    } catch {
      toast.error("Failed to copy links.");
    }
  };

  const copyLink = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case "ONPAPER":
        return "On Paper";
      case "PRESENTATION":
        return "Presentation";
      case "ASSIGNMENT":
        return "Assignment";
      default:
        return t;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex flex-col p-6 overflow-hidden bg-card ${
          resultMode === "subject" ||
          (method === "manual" && selectedComponentId !== null)
            ? "sm:max-w-3xl"
            : "sm:max-w-md"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Collect Exam Results
          </DialogTitle>
          <DialogDescription>
            Choose how to input student results for this exam.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex border rounded-lg p-1 bg-muted/30">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              resultMode === "component"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setResultMode("component")}
          >
            <FileText className="h-4 w-4" />
            By Component
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              resultMode === "subject"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setResultMode("subject")}
          >
            <Layers className="h-4 w-4" />
            By Subject
          </button>
        </div>

        <div className="space-y-6 py-4">
          {/* ==================== BY COMPONENT MODE ==================== */}
          {resultMode === "component" && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="component-select"
                  className="text-sm font-medium"
                >
                  Exam Component
                </Label>
                <Select
                  value={selectedComponentId ? String(selectedComponentId) : ""}
                  onValueChange={(value) => {
                    setSelectedComponentId(value ? Number(value) : null);
                    setCreatedLink(null);
                  }}
                >
                  <SelectTrigger id="component-select" className="w-full">
                    <SelectValue placeholder="Select Exam Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.subject_name || "Unknown"}{" "}
                        <span className="text-muted-foreground">
                          ({c.type?.toLowerCase()})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method-select" className="text-sm font-medium">
                  Data Entry Method
                </Label>
                <Select
                  value={method}
                  onValueChange={(value) =>
                    setMethod(value as CollectionMethod)
                  }
                >
                  <SelectTrigger id="method-select" className="w-full">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="excel">Excel Import</SelectItem>
                    <SelectItem value="link">Shareable Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border border-dashed p-6 text-center bg-muted/30 min-h-40 flex flex-col justify-center">
                {method === "manual" && (
                  <div className="space-y-4 text-left">
                    <div className="text-center">
                      <p className="font-semibold text-sm">Manual Entry Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Enter marks and remarks for each student.
                      </p>
                    </div>

                    {!selectedComponentId ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Select an exam component above to begin.
                      </p>
                    ) : (
                      <>
                        <div className="max-h-64 overflow-y-auto border rounded-md">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0">
                              <tr className="border-b">
                                <th className="py-2 px-3 text-left font-medium w-10">
                                  #
                                </th>
                                <th className="py-2 px-3 text-left font-medium">
                                  Student ID
                                </th>
                                <th className="py-2 px-3 text-left font-medium">
                                  Name
                                </th>
                                <th className="py-2 px-3 text-left font-medium">
                                  Marks / 100
                                </th>
                                <th className="py-2 px-3 text-left font-medium">
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((s, idx) => (
                                <tr
                                  key={s.id}
                                  className="border-b hover:bg-muted/30"
                                >
                                  <td className="py-1.5 px-3 text-muted-foreground text-xs">
                                    {idx + 1}
                                  </td>
                                  <td className="py-1.5 px-3 font-mono text-xs">
                                    {s.studentSchoolId}
                                  </td>
                                  <td className="py-1.5 px-3 text-xs">
                                    {s.fullName}
                                  </td>
                                  <td className="py-1.5 px-3">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      className="h-8 text-xs w-full"
                                      placeholder="-"
                                      value={manualMarks[s.id] ?? ""}
                                      onChange={(e) =>
                                        setManualMarks((prev) => ({
                                          ...prev,
                                          [s.id]: e.target.value,
                                        }))
                                      }
                                    />
                                  </td>
                                  <td className="py-1.5 px-3">
                                    <Input
                                      className="h-8 text-xs w-full"
                                      placeholder="Optional"
                                      value={manualRemarks[s.id] ?? ""}
                                      onChange={(e) =>
                                        setManualRemarks((prev) => ({
                                          ...prev,
                                          [s.id]: e.target.value,
                                        }))
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <Button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleManualSubmit}
                          className="w-full text-xs h-9 bg-primary/90 hover:bg-primary text-white disabled:opacity-50"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : `Submit Results (${students.filter((s) => manualMarks[s.id] !== "").length} students)`}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {method === "excel" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Excel Import Mode</p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Upload a spreadsheet (.csv, .xls, .xlsx) containing the
                        result ledger.
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv, .xls, .xlsx, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        onClick={triggerFileInput}
                        variant="outline"
                        className="gap-2 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" /> Select File
                      </Button>
                      <Button
                        type="button"
                        onClick={handleMajorsExportCSV}
                        variant="secondary"
                        className="gap-2 cursor-pointer"
                      >
                        <Download className="h-4 w-4" /> Template
                      </Button>
                    </div>

                    {selectedFile && parsedJsonPayload && (
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-left space-y-2">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                          <div className="truncate block w-full">
                            <span className="text-xs font-medium text-slate-700 block truncate">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {parsedJsonPayload.length} records parsed
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleUploadSubmit}
                          className="w-full text-xs h-8 bg-primary/90 hover:bg-primary text-white disabled:opacity-50"
                        >
                          {isSubmitting
                            ? "Processing..."
                            : "Process Ledger Data"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {method === "link" && (
                  <div className="space-y-4 text-left">
                    <div className="text-center">
                      <p className="font-semibold text-sm">
                        Shareable Link Mode
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Generate a secure link for faculty members to submit
                        results.
                      </p>
                    </div>

                    {!selectedComponentId ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Select an exam component above to begin.
                      </p>
                    ) : createdLink ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
                          <input
                            type="text"
                            readOnly
                            value={createdLink}
                            className="flex-1 text-xs bg-transparent border-none outline-none truncate text-slate-700"
                          />
                          <Button
                            type="button"
                            onClick={copyLink}
                            size="sm"
                            className="shrink-0 gap-1 h-8 text-xs cursor-pointer"
                          >
                            <Share className="h-3 w-3" /> Copy
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                          Share this link with the faculty member to collect
                          results.
                        </p>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        disabled={isCreatingLink}
                        onClick={createLink}
                        className="gap-2 cursor-pointer mx-auto"
                      >
                        <Share className="h-4 w-4" />
                        {isCreatingLink ? "Creating..." : "Create Link"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==================== BY SUBJECT MODE ==================== */}
          {resultMode === "subject" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="subject-select" className="text-sm font-medium">
                  Subject
                </Label>
                <Select
                  value={selectedSubject}
                  onValueChange={(value) => {
                    setSelectedSubject(value);
                    setSubjectMarks({});
                    setSubjectRemarks({});
                    setSubjectFile(null);
                    setSubjectParsedData(null);
                    setSubjectLinks([]);
                  }}
                >
                  <SelectTrigger id="subject-select" className="w-full">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {papers.map((p) => (
                      <SelectItem key={p.subject} value={p.subject}>
                        {p.subject_name || p.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedSubject ? (
                <div className="rounded-md border border-dashed p-6 text-center bg-muted/30 min-h-40 flex flex-col justify-center">
                  <p className="text-sm text-muted-foreground">
                    Select a subject above to begin.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="subject-method-select"
                      className="text-sm font-medium"
                    >
                      Data Entry Method
                    </Label>
                    <Select
                      value={subjectMethod}
                      onValueChange={(value) =>
                        setSubjectMethod(value as CollectionMethod)
                      }
                    >
                      <SelectTrigger
                        id="subject-method-select"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="excel">Excel Import</SelectItem>
                        <SelectItem value="link">Shareable Links</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Component badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {subjectComponents.map((comp) => (
                      <span
                        key={comp.type}
                        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium"
                      >
                        <span className="capitalize">
                          {typeLabel(comp.type)}
                        </span>
                        <span className="text-muted-foreground">
                          {comp.marks_allocated} marks
                        </span>
                        <span className="text-muted-foreground">
                          [{comp.duration}]
                        </span>
                      </span>
                    ))}
                  </div>

                  <div className="rounded-md border border-dashed p-4 text-center bg-muted/30">
                    {/* ----- MANUAL ----- */}
                    {subjectMethod === "manual" && (
                      <div className="space-y-4 text-left">
                        <div className="max-h-80 overflow-auto border rounded-md">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0">
                              <tr className="border-b">
                                <th className="py-2 px-3 text-left font-medium w-10">
                                  #
                                </th>
                                <th className="py-2 px-3 text-left font-medium">
                                  Student ID
                                </th>
                                <th className="py-2 px-3 text-left font-medium">
                                  Name
                                </th>
                                {subjectComponents.map((comp) => (
                                  <th
                                    key={comp.type}
                                    className="py-2 px-3 text-left font-medium text-xs whitespace-nowrap"
                                  >
                                    {typeLabel(comp.type)}
                                    <br />
                                    <span className="font-normal text-muted-foreground">
                                      / 100
                                    </span>
                                  </th>
                                ))}
                                <th className="py-2 px-3 text-left font-medium">
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((s, idx) => (
                                <tr
                                  key={s.id}
                                  className="border-b hover:bg-muted/30"
                                >
                                  <td className="py-1.5 px-3 text-muted-foreground text-xs">
                                    {idx + 1}
                                  </td>
                                  <td className="py-1.5 px-3 font-mono text-xs">
                                    {s.studentSchoolId}
                                  </td>
                                  <td className="py-1.5 px-3 text-xs">
                                    {s.fullName}
                                  </td>
                                  {subjectComponents.map((comp) => {
                                    const existing = s.examResults.find(
                                      (r) =>
                                        r.component.type === comp.type &&
                                        r.component.subject_name ===
                                          (selectedSubjectPaper?.subject_name ||
                                            ""),
                                    );
                                    const key = `${s.id}-${comp.type}`;
                                    return (
                                      <td key={key} className="py-1.5 px-3">
                                        <Input
                                          type="number"
                                          min={0}
                                          max={100}
                                          className="h-8 text-xs w-20"
                                          placeholder="-"
                                          value={
                                            subjectMarks[key] ??
                                            (existing
                                              ? unscaleMark(
                                                  existing.marksObtained,
                                                  existing.component
                                                    .marks_allocated,
                                                )
                                              : "")
                                          }
                                          onChange={(e) =>
                                            setSubjectMarks((prev) => ({
                                              ...prev,
                                              [key]: e.target.value,
                                            }))
                                          }
                                        />
                                      </td>
                                    );
                                  })}
                                  <td className="py-1.5 px-3">
                                    <Input
                                      className="h-8 text-xs w-full"
                                      placeholder="Optional"
                                      value={
                                        subjectRemarks[`${s.id}-general`] ?? ""
                                      }
                                      onChange={(e) =>
                                        setSubjectRemarks((prev) => ({
                                          ...prev,
                                          [`${s.id}-general`]: e.target.value,
                                        }))
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <Button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleSubjectSubmit}
                          className="w-full text-xs h-9 bg-primary/90 hover:bg-primary text-white disabled:opacity-50"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : `Submit All Components (${students.filter((s) => subjectComponents.some((c) => subjectMarks[`${s.id}-${c.type}`] !== "" && subjectMarks[`${s.id}-${c.type}`] !== undefined)).length} students)`}
                        </Button>
                      </div>
                    )}

                    {/* ----- EXCEL ----- */}
                    {subjectMethod === "excel" && (
                      <div className="space-y-4 text-left">
                        <div className="text-center">
                          <p className="font-semibold text-sm">
                            Excel Import (Subject)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Upload a spreadsheet with columns: Student ID,{" "}
                            {subjectComponents
                              .map((c) => typeLabel(c.type))
                              .join(", ")}
                            , Remarks
                          </p>
                        </div>

                        <div className="flex justify-center gap-2">
                          <input
                            type="file"
                            ref={subjectFileInputRef}
                            className="hidden"
                            accept=".csv, .xls, .xlsx, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleSubjectFileChange}
                          />
                          <Button
                            type="button"
                            onClick={triggerSubjectFileInput}
                            variant="outline"
                            className="gap-2 cursor-pointer"
                          >
                            <Upload className="h-4 w-4" /> Select File
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSubjectExportCSV}
                            variant="secondary"
                            className="gap-2 cursor-pointer"
                          >
                            <Download className="h-4 w-4" /> Template
                          </Button>
                        </div>

                        {subjectFile && subjectParsedData && (
                          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-left space-y-2">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                              <div className="truncate block w-full">
                                <span className="text-xs font-medium text-slate-700 block truncate">
                                  {subjectFile.name}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  {subjectParsedData.reduce(
                                    (a, r) => a + r.students.length,
                                    0,
                                  )}{" "}
                                  records across{" "}
                                  {
                                    subjectParsedData.filter(
                                      (r) => r.students.length > 0,
                                    ).length
                                  }{" "}
                                  type(s)
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              disabled={isSubmitting}
                              onClick={handleSubjectUploadSubmit}
                              className="w-full text-xs h-8 bg-primary/90 hover:bg-primary text-white disabled:opacity-50"
                            >
                              {isSubmitting
                                ? "Processing..."
                                : "Process Ledger Data"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ----- LINK ----- */}
                    {subjectMethod === "link" && (
                      <div className="space-y-4 text-left">
                        <div className="text-center">
                          <p className="font-semibold text-sm">
                            Shareable Links (Subject)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Generate one share link per component type for this
                            subject.
                          </p>
                        </div>

                        {subjectLinks.length > 0 ? (
                          <div className="space-y-3">
                            {subjectLinks.map((link) => (
                              <div
                                key={link.type}
                                className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200"
                              >
                                <span className="text-xs font-medium capitalize shrink-0 w-20">
                                  {typeLabel(link.type)}
                                </span>
                                <input
                                  type="text"
                                  readOnly
                                  value={link.url}
                                  className="flex-1 text-xs bg-transparent border-none outline-none truncate text-slate-700"
                                />
                                <Button
                                  type="button"
                                  onClick={() => copySubjectLink(link.url)}
                                  size="sm"
                                  className="shrink-0 gap-1 h-8 text-xs cursor-pointer"
                                >
                                  <Share className="h-3 w-3" /> Copy
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              onClick={copyAllSubjectLinks}
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                            >
                              Copy All Links
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            disabled={isCreatingSubjectLinks}
                            onClick={handleSubjectCreateLinks}
                            className="gap-2 cursor-pointer mx-auto"
                          >
                            <Share className="h-4 w-4" />
                            {isCreatingSubjectLinks
                              ? "Creating Links..."
                              : `Generate ${subjectComponents.length} Link${subjectComponents.length !== 1 ? "s" : ""}`}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
