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
import { Download, Share, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { ExamPaper } from "@/types";
import { apiPost } from "@/lib/api-client";
import { toast } from "sonner";
import { StudentExam } from "@/app/exam/exams/[id]/page";

interface ExamDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportCSV: () => void;
  onSuccessStudentResultAdd: () => void;
  papers: ExamPaper[];
  students: StudentExam[];
}

type CollectionMethod = "manual" | "excel" | "link";

interface ExtractedExamResult {
  student: string;
  marks_obtained: number;
  status: string;
  remarks: string;
}

export function ExamResultCollectModal({
  open,
  onOpenChange,
  onExportCSV,
  onSuccessStudentResultAdd,
  papers,
  students,
}: ExamDetailModalProps) {
  const [method, setMethod] = useState<CollectionMethod>("manual");
  const [examPaperId, setExamPaperId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedJsonPayload, setParsedJsonPayload] = useState<
    ExtractedExamResult[] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const selectedPaper = useMemo(
    () => papers.find((p) => p.id === examPaperId),
    [papers, examPaperId],
  );

  const [manualMarks, setManualMarks] = useState<Record<string, string>>({});
  const [manualRemarks, setManualRemarks] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (open && method === "manual" && examPaperId) {
      const marks: Record<string, string> = {};
      const remarks: Record<string, string> = {};
      for (const s of students) {
        const existing = s.examResults.find(
          (r) => r.examPaper.id === examPaperId,
        );
        marks[s.id] = existing ? String(existing.marksObtained) : "";
        remarks[s.id] = existing ? existing.remarks : "";
      }
      setManualMarks(marks);
      setManualRemarks(remarks);
    }
  }, [open, method, examPaperId, students]);

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
    if (!examPaperId || examPaperId === "" || results.length === 0) return;

    setIsSubmitting(true);

    // const data = results.map((r) => {
    //   const matchingStudent = students.find(
    //     (s) => s.studentSchoolId === r.student,
    //   );
    //   return {
    //     ...r,
    //     student: matchingStudent ? matchingStudent.student_id : r.student,
    //   };
    // });

    const payload = {
      exam_paper: examPaperId,
      results: results,
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
      !examPaperId ||
      examPaperId === ""
    )
      return;
    await submitResults(parsedJsonPayload);
  };

  const handleManualSubmit = async () => {
    if (!examPaperId || examPaperId === "") return;

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
    if (!examPaperId || examPaperId === "") return;
    setIsCreatingLink(true);
    try {
      const res: { success: boolean; data: { code: string } } = await apiPost(
        `/exam/share-links/`,
        { exam_paper: examPaperId },
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

  const copyLink = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex flex-col p-6 overflow-hidden bg-white ${
          method === "manual" && examPaperId ? "sm:max-w-2xl" : "sm:max-w-md"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Collect Exam Results
          </DialogTitle>
          <DialogDescription>
            Select how you would like to input the student results for this
            intake.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="paper-select" className="text-sm font-medium">
              Exam Paper
            </Label>
            <Select
              value={examPaperId}
              onValueChange={(value) => {
                setExamPaperId(value);
                setCreatedLink(null);
              }}
            >
              <SelectTrigger id="paper-select" className="w-full">
                <SelectValue placeholder="Select Exam Paper" />
              </SelectTrigger>
              <SelectContent>
                {papers.map((p) => (
                  <SelectItem key={p.id} value={p?.id || ""}>
                    {p.subject_name}
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
              onValueChange={(value) => setMethod(value as CollectionMethod)}
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

          {/* Conditional Rendering Workspace Area */}
          <div className="rounded-md border border-dashed p-6 text-center bg-muted/30 min-h-40 flex flex-col justify-center">
            {method === "manual" && (
              <div className="space-y-4 text-left">
                <div className="text-center">
                  <p className="font-semibold text-sm">Manual Entry Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Enter marks and remarks for each student.
                  </p>
                </div>

                {!examPaperId ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select an exam paper above to begin.
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
                              Marks / {selectedPaper?.total_marks || "?"}
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
                                  max={selectedPaper?.total_marks || 999}
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
                    <Upload className="h-4 w-4" />
                    Select File
                  </Button>
                  <Button
                    type="button"
                    onClick={handleMajorsExportCSV}
                    variant="secondary"
                    className="gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Template
                  </Button>
                </div>

                {/* File Selected Status & Ingestion Submit Button */}
                {selectedFile && parsedJsonPayload && (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                      <div className="truncate block w-full">
                        <span className="text-xs font-medium text-slate-700 block truncate">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {parsedJsonPayload.length} records parsed successfully
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
                        ? "Processing Transaction..."
                        : "Process Ledger Data"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {method === "link" && (
              <div className="space-y-4 text-left">
                <div className="text-center">
                  <p className="font-semibold text-sm">Shareable Link Mode</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Generate a secure link for faculty members to submit
                    results.
                  </p>
                </div>

                {!examPaperId ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select an exam paper above to begin.
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
                        <Share className="h-3 w-3" />
                        Copy
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
