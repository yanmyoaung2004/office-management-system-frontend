"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, X, File, Calendar, Clock, BookOpen } from "lucide-react";
import { ExamSchedule } from "@/types";
import { toast } from "sonner";

interface ExamDetailModalProps {
  exam: ExamSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamDetailModal({
  exam,
  open,
  onOpenChange,
}: ExamDetailModalProps) {
  const [uploadingPapers, setUploadingPapers] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({});

  if (!exam) return null;

  const handleFileSelect = (subjectId: string, file: File | null) => {
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setUploadedFiles((prev) => ({
        ...prev,
        [subjectId]: file,
      }));
    }
  };

  const handleUpload = async (subjectId: string) => {
    const file = uploadedFiles[subjectId];
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setUploadingPapers((prev) => ({
        ...prev,
        [subjectId]: true,
      }));

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject_id", subjectId);
      formData.append("exam_id", exam.id);

      // TODO: Replace with your actual upload endpoint
      const response = await fetch("/api/exam/upload-paper", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success(`Paper uploaded successfully for ${file.name}`);
      setUploadedFiles((prev) => ({
        ...prev,
        [subjectId]: null,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingPapers((prev) => ({
        ...prev,
        [subjectId]: false,
      }));
    }
  };

  const getSubjectName = (subjectId: string) => {
    // Extract subject name from papers or use ID as fallback
    return subjectId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[60vw] max-h-[90vh] overflow-y-auto">
        {/* <DialogContent className="sm:max-w-[90vw] w-[90vw] max-h-[90vh] flex flex-col p-0 overflow-hidden"> */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {exam.title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription />

        <div className="space-y-6">
          {/* Exam Overview */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Exam Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Intake</p>
                  <p className="font-medium">{exam.intake}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Semester</p>
                  <p className="font-medium">{exam.semester_name}</p>
                </div>
                <div className="space-y-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{exam.date_started}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Papers</p>
                  <Badge variant="secondary">
                    {exam.papers?.length || 0} Papers
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Papers with Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Exam Papers & Question Upload
              </h3>
            </div>

            {exam.papers && exam.papers.length > 0 ? (
              <div className="space-y-4">
                {exam.papers.map((paper) => {
                  const subjectId = paper.subject;
                  const isUploading = uploadingPapers[subjectId];
                  const selectedFile = uploadedFiles[subjectId];

                  return (
                    <Card key={subjectId} className="border">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Paper Details */}
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Subject
                              </p>
                              <p className="font-medium">
                                {getSubjectName(subjectId)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Total Marks
                              </p>
                              <p className="font-medium">{paper.total_marks}</p>
                            </div>
                            <div className="space-y-1 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Duration
                                </p>
                                <p className="font-medium text-sm">
                                  {paper.duration}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Type
                              </p>
                              <Badge variant="outline" className="w-fit">
                                {paper.type}
                              </Badge>
                            </div>
                          </div>

                          <Separator />

                          {/* File Upload Section */}
                          <div className="space-y-3">
                            <p className="text-sm font-medium">
                              Upload Question Paper
                            </p>

                            {/* File Input */}
                            <div className="relative">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) =>
                                  handleFileSelect(
                                    subjectId,
                                    e.target.files?.[0] || null,
                                  )
                                }
                                className="hidden"
                                id={`file-${subjectId}`}
                                disabled={isUploading}
                              />

                              <label
                                htmlFor={`file-${subjectId}`}
                                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                              >
                                <Upload className="h-5 w-5 text-muted-foreground" />
                                <div className="text-center">
                                  <p className="text-sm font-medium">
                                    {selectedFile
                                      ? selectedFile.name
                                      : "Click to upload or drag & drop"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF file up to 10MB
                                  </p>
                                </div>
                              </label>
                            </div>

                            {/* Selected File Info */}
                            {selectedFile && (
                              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium truncate">
                                      {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {(
                                        selectedFile.size /
                                        1024 /
                                        1024
                                      ).toFixed(2)}{" "}
                                      MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    setUploadedFiles((prev) => ({
                                      ...prev,
                                      [subjectId]: null,
                                    }))
                                  }
                                  disabled={isUploading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {/* Upload Button */}
                            <Button
                              onClick={() => handleUpload(subjectId)}
                              disabled={!selectedFile || isUploading}
                              className="w-full gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {isUploading ? "Uploading..." : "Upload Paper"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No papers added to this exam yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
