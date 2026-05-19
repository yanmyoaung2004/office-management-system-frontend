"use client";

import { useRef, useState } from "react";
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
import { Button } from "../ui/button";
import { Download, Share, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { ExamPaper, Student } from "@/types";
import { apiPost } from "@/lib/api-client";
import { toast } from "sonner";

interface ExamDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportCSV: () => void;
  onManualImport: () => void;
  papers: ExamPaper[];
  students: Student[];
}

type CollectionMethod = "manual" | "excel" | "link";

// Define the shape of the extracted JSON matching your specification
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
  onManualImport,
  papers,
  students,
}: ExamDetailModalProps) {
  const [method, setMethod] = useState<CollectionMethod>("manual");
  const [examPaperId, setExamPaperId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track both the physical file details and the extracted JSON payload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedJsonPayload, setParsedJsonPayload] = useState<
    ExtractedExamResult[] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
              status: "PUBLISHED", // Hardcoded fallback default string value as requested
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

  const handleUploadSubmit = async () => {
    if (
      !parsedJsonPayload ||
      parsedJsonPayload.length === 0 ||
      !examPaperId ||
      examPaperId === ""
    )
      return;

    setIsSubmitting(true);

    const data = parsedJsonPayload.map((data) => {
      const matchingStudent = students.find(
        (s) => s.studentSchoolId === data.student,
      );
      return {
        ...data,
        student: matchingStudent ? matchingStudent.student_id : data.student,
      };
    });

    const payload = {
      exam_paper: examPaperId,
      results: data,
    };

    try {
      const response: { success: boolean; message: string; error: string } =
        await apiPost("/exam/exam-result/", payload);

      const { success, message, error: errorMessage } = response;

      if (!success) {
        throw new Error(errorMessage);
      }

      toast.success(message);
      // Cleanup states and close dialog window on success
      setSelectedFile(null);
      setParsedJsonPayload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onOpenChange(false);
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col p-6 overflow-hidden max-w-md bg-white">
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
              onValueChange={(value) => setExamPaperId(value)}
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
              <div className="space-y-3">
                <p className="font-semibold text-sm">Manual Entry Mode</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Directly input student IDs, names, and distinctions into the
                  system.
                </p>
                <Button
                  onClick={onManualImport}
                  className="gap-2 cursor-pointer mx-auto"
                >
                  <Download className="h-4 w-4" />
                  Import Now
                </Button>
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
              <div className="space-y-3">
                <p className="font-semibold text-sm">Shareable Link Mode</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Generate a secure link for faculty members to submit results.
                </p>
                <Button
                  onClick={handleMajorsExportCSV}
                  className="gap-2 cursor-pointer mx-auto"
                >
                  <Share className="h-4 w-4" />
                  Create Link
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
