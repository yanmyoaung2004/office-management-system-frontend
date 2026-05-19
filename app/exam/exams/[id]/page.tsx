"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { ExamSchedule, ExamPaper, Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  FileCheck,
  FileText,
} from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { searchStudentExam } from "@/lib/search-utils";
import { Pagination } from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { ExamResultCollectModal } from "@/components/exam/exam-result-collect-modal";
import { handleExportCSV } from "@/lib/utils";

interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const ITEMS_PER_PAGE = 6;

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [uploadingPaperId, setUploadingPaperId] = useState<string | null>(null);
  const [draggedPaperId, setDraggedPaperId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR<
    PaginatedResponse<{
      exam: ExamSchedule;
      eligible_students: Student[];
    }>
  >(examId ? `/exam/exams/${examId}` : null, { revalidateOnFocus: false });

  const exam = response?.data?.exam;
  const students = response?.data.eligible_students || [];

  const filteredStudents = searchStudentExam(students, searchQuery);
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  console.log(filteredStudents);

  const handleFileSelect = async (file: File, paperId: string) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    await uploadFile(file, paperId);
  };

  const uploadFile = async (file: File, paperId: string) => {
    try {
      setUploadingPaperId(paperId);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("paperId", paperId);
      formData.append("examId", examId);

      const response = await fetch("/api/exam/upload-paper", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("File uploaded successfully");
        mutate();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("[v0] Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploadingPaperId(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, paperId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedPaperId(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0], paperId);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading exam details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Exam not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const examDate = new Date(exam.date_started).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleMajorsExportCSV = () => {
    const headers = ["No", "Student ID", "Student Name", "Marks", "Remarks"];
    const rows: (string | number)[][] = [];
    let globalCounter = 1;

    students.forEach((s) => {
      if (s.fullName) {
        rows.push([
          globalCounter++,
          s?.studentSchoolId || "Not Set",
          s.fullName || "",
        ]);
        return;
      }
    });

    const fileName = `exam-${new Date().toISOString().split("T")[0]}.csv`;
    handleExportCSV(headers, rows, fileName);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex justify-between w-full">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Exam Details
              </h1>
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="hover:bg-primary/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <div className="space-y-1 md:pl-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Exam Title
              </p>
              <p className="font-bold text-slate-800">{exam.title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Semester
              </p>
              <p className="font-mono font-bold text-primary">
                {exam.semester_name}
              </p>
            </div>
            <div className="space-y-1 md:border-x md:px-8 border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheduled Date
              </p>
              <p className="font-bold text-slate-800">{examDate}</p>
            </div>
          </div>
          <section className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Question Papers
              </h2>
              <Badge variant="outline" className="rounded-full px-3">
                {exam.papers.length}
              </Badge>
            </div>

            {exam.papers.length === 0 ? (
              <Card className="border-dashed border-2 bg-slate-50/30">
                <CardContent className="py-16 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    No papers have been assigned to this exam yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {exam.papers.map((paper: ExamPaper) => (
                  <Card
                    key={paper.id}
                    className="group overflow-hidden border-slate-200 transition-all hover:shadow-lg hover:border-primary/20"
                  >
                    <CardHeader className="pb-4 border-b bg-white">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">
                            {paper.subject_name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <span>{paper.total_marks} Marks</span>
                            <span className="text-slate-300">•</span>
                            <span>{paper.duration} Mins</span>
                          </div>
                        </div>
                        <Badge className="bg-slate-100 text-slate-600 border-none hover:bg-slate-200 capitalize">
                          {paper.type.toLowerCase()}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      {paper.uploaded_file ? (
                        /* SUCCESS STATE */
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md">
                              <FileCheck className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-emerald-900">
                                {paper.uploaded_file.fileName}
                              </p>
                              <p className="text-xs text-emerald-700/70 font-medium">
                                {(paper.uploaded_file.fileSize / 1024).toFixed(
                                  2,
                                )}{" "}
                                KB • Uploaded{" "}
                                {new Date(
                                  paper.uploaded_file.uploadDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                              onClick={() =>
                                window.open(
                                  paper.uploaded_file?.fileUrl,
                                  "_blank",
                                )
                              }
                            >
                              <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* UPLOAD STATE */
                        <div
                          onDrop={(e) => handleDrop(e, paper.id || "")}
                          onDragOver={handleDragOver}
                          onDragEnter={() =>
                            setDraggedPaperId(paper.id || null)
                          }
                          onDragLeave={() => setDraggedPaperId(null)}
                          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer
                                  ${
                                    draggedPaperId === paper.id
                                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                                      : "border-slate-200 hover:border-primary/40 hover:bg-slate-50"
                                  }`}
                        >
                          <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 cursor-pointer opacity-0 z-10"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileSelect(
                                  e.target.files[0],
                                  paper.id || "",
                                );
                              }
                            }}
                          />
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                              <Upload className="h-7 w-7" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                              {uploadingPaperId === paper.id
                                ? "Uploading..."
                                : "Click to upload or drag and drop"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400 font-medium">
                              PDF up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </CardContent>
      </Card>

      <ExamResultCollectModal
        onManualImport={() => console.log("manual Import")}
        open={showDetail}
        onOpenChange={setShowDetail}
        onExportCSV={handleMajorsExportCSV}
        papers={exam.papers}
        students={students}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Students ({students.length})</span>
            <Button
              className="mb-6 bg-primary cursor-pointer"
              onClick={() => {
                setShowDetail(true);
              }}
            >
              Add Result
            </Button>
          </CardTitle>

          <Input
            placeholder="Search by name, code, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white text-sm pt-2"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-semibold">
                    Student ID
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Student Name
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">
                        {s.studentSchoolId || "STI-306"}{" "}
                      </td>
                      <td className="py-3 px-4">{s.fullName}</td>
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
                    <td className="py-6 text-center text-muted-foreground">
                      No Student found
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
    </main>
  );
}
