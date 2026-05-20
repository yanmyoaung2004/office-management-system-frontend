"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, AlertCircle, CheckCircle2, Pencil, Eye } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

interface ShareExamResult {
  marksObtained: string;
  status: string;
  remarks: string;
}

interface ShareStudent {
  id: number;
  student_id: string;
  studentSchoolId: string;
  fullName: string;
  status: string;
  examResults: ShareExamResult[];
}

interface ShareComponent {
  id: number;
  type: string;
  marks_allocated: number;
  duration: string;
  exam_date: string;
}

interface SharePaper {
  id: number;
  subject_name: string;
  components: ShareComponent[];
}

interface ShareData {
  exam: {
    id: string;
    title: string;
    date_started: string;
    semester_name: string;
  };
  paper: SharePaper;
  eligible_students: ShareStudent[];
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/exam/share-links/${token}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          const initialMarks: Record<string, string> = {};
          const initialRemarks: Record<string, string> = {};
          for (const s of json.data.eligible_students) {
            const existing = s.examResults?.[0];
            initialMarks[s.id] = existing ? String(existing.marksObtained) : "";
            initialRemarks[s.id] = existing ? existing.remarks : "";
          }
          setMarks(initialMarks);
          setRemarks(initialRemarks);
        } else {
          setError(json.error || "Invalid or expired link.");
        }
      } catch {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async () => {
    if (!data) return;

    const results = data.eligible_students
      .filter((s) => marks[s.id] !== undefined && marks[s.id] !== "")
      .map((s) => ({
        student: s.studentSchoolId,
        marks_obtained: Number(marks[s.id]),
        status: "PENDING",
        remarks: remarks[s.id] || "",
      }));

    if (results.length === 0) {
      toast.error("Enter marks for at least one student.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/exam/share-links/${token}/results`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results }),
        },
      );
      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
        toast.success(json.message || "Results submitted!");
      } else {
        toast.error(json.error || "Submission failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <Card className="max-w-md w-full mx-4 border-destructive/30">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="font-semibold text-destructive">
              {error || "Unable to load data"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <Card className="max-w-md w-full mx-4 border-emerald-200">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <p className="font-semibold text-emerald-700 text-lg">
              Results Submitted!
            </p>
            <p className="text-sm text-muted-foreground">
              Thank you for submitting the exam results.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <Toaster position="top-center" />
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">{data.exam.title}</CardTitle>
          <div className="flex gap-3 text-sm text-muted-foreground mt-2">
            <Badge variant="secondary">{data.paper.subject_name}</Badge>
            {data.paper.components?.[0] && (
              <>
                <Badge variant="outline" className="capitalize">
                  {data.paper.components[0].type?.toLowerCase()}
                </Badge>
                <Badge variant="outline">
                  {data.paper.components[0].marks_allocated} marks
                </Badge>
              </>
            )}
            <Badge variant="outline">{data.exam.semester_name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Students ({data.eligible_students.length})
            </p>
            <Button
              type="button"
              variant={editMode ? "outline" : "default"}
              size="sm"
              onClick={() => setEditMode((prev) => !prev)}
              className="gap-1.5 text-xs h-8"
            >
              {editMode ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  View Mode
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Results
                </>
              )}
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium w-10">#</th>
                  <th className="py-2 px-3 text-left font-medium">
                    Student ID
                  </th>
                  <th className="py-2 px-3 text-left font-medium">Name</th>
                  <th className="py-2 px-3 text-left font-medium w-28">
                    Marks / {data.paper.components?.[0]?.marks_allocated || "?"}
                  </th>
                  <th className="py-2 px-3 text-left font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data.eligible_students.map((s, idx) => {
                  const existing = s.examResults?.[0];
                  return (
                    <tr key={s.id} className="border-b hover:bg-muted/30">
                      <td className="py-1.5 px-3 text-muted-foreground text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-xs">
                        {s.studentSchoolId}
                      </td>
                      <td className="py-1.5 px-3 text-xs">{s.fullName}</td>
                      <td className="py-1.5 px-3">
                        {editMode ? (
                          <Input
                            type="number"
                            min={0}
                            max={data.paper.components?.[0]?.marks_allocated || 999}
                            className="h-8 text-xs w-full"
                            placeholder="-"
                            value={marks[s.id] ?? ""}
                            onChange={(e) =>
                              setMarks((prev) => ({
                                ...prev,
                                [s.id]: e.target.value,
                              }))
                            }
                          />
                        ) : existing ? (
                          <span className="text-sm font-medium">
                            {existing.marksObtained}
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              / {data.paper.components?.[0]?.marks_allocated || "?"}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No Record
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-3">
                        {editMode ? (
                          <Input
                            className="h-8 text-xs w-full"
                            placeholder="Optional"
                            value={remarks[s.id] ?? ""}
                            onChange={(e) =>
                              setRemarks((prev) => ({
                                ...prev,
                                [s.id]: e.target.value,
                              }))
                            }
                          />
                        ) : existing ? (
                          <span className="text-xs text-muted-foreground">
                            {existing.remarks || "\u2014"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            {"\u2014"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {editMode && (
            <Button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full"
            >
              {submitting
                ? "Submitting..."
                : `Submit Results (${data.eligible_students.filter((s) => marks[s.id] !== "").length} students)`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
