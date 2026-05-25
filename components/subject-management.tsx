"use client";

import { useEffect, useState } from "react";
import type { Major } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, BookOpen, Save, X } from "lucide-react";

interface SemesterSubject {
  id: string;
  name: string;
  code: string;
}

interface SemesterDetail {
  id: string;
  yearName: string;
  semester_number: number;
  name: string;
  subjects: SemesterSubject[];
}

interface SubjectData {
  semester: SemesterDetail;
  subjects: SemesterSubject[];
}

interface SubjectManagementProps {
  major: Major;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PendingSubject {
  code: string;
  name: string;
  description: string;
}

export function SubjectManagement({
  major,
  open,
  onOpenChange,
}: SubjectManagementProps) {
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [pendingSubjects, setPendingSubjects] = useState<PendingSubject[]>([
    { code: "", name: "", description: "" },
  ]);

  const years = major.years || [];
  const selectedYear = years.find((y) => y.id === selectedYearId);
  const semesters = selectedYear?.semesters || [];

  useEffect(() => {
    setSelectedYearId("");
    setSelectedSemesterId("");
    setSubjectData(null);
    setShowBatchAdd(false);
    setPendingSubjects([{ code: "", name: "", description: "" }]);
  }, [major.id, open]);

  const fetchSubjects = async (semesterId: string) => {
    setLoading(true);
    try {
      const res = await apiGet<{
        success: boolean;
        data: SubjectData;
      }>(`/admission/semesters/${semesterId}/subjects`);
      if (res.success) {
        setSubjectData(res.data);
      }
    } catch {
      toast.error("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterSelect = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setShowBatchAdd(false);
    setPendingSubjects([{ code: "", name: "", description: "" }]);
    fetchSubjects(semesterId);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      const res = await apiDelete<{ success: boolean; message: string }>(
        `/admission/semesters/${selectedSemesterId}/subjects?subject_id=${subjectId}`,
      );
      if (res.success) {
        toast.success(res.message || "Subject removed.");
        fetchSubjects(selectedSemesterId);
      }
    } catch {
      toast.error("Failed to remove subject.");
    }
  };

  const updatePending = (
    index: number,
    field: keyof PendingSubject,
    value: string,
  ) => {
    setPendingSubjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPendingRow = () => {
    setPendingSubjects((prev) => [
      ...prev,
      { code: "", name: "", description: "" },
    ]);
  };

  const removePendingRow = (index: number) => {
    setPendingSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchAdd = async () => {
    const valid = pendingSubjects.filter((p) => p.code.trim() && p.name.trim());
    if (valid.length === 0) {
      toast.error("Fill in at least one subject with code and name.");
      return;
    }

    setAdding(true);
    try {
      const res = await apiPost<{ success: boolean; message: string }>(
        `/admission/semesters/${selectedSemesterId}/subjects`,
        { subjects: valid },
      );
      if (res.success) {
        toast.success(res.message || `Added ${valid.length} subject(s).`);
        setShowBatchAdd(false);
        setPendingSubjects([{ code: "", name: "", description: "" }]);
        fetchSubjects(selectedSemesterId);
      }
    } catch {
      toast.error("Failed to add subjects.");
    } finally {
      setAdding(false);
    }
  };

  const reset = () => {
    setSelectedYearId("");
    setSelectedSemesterId("");
    setSubjectData(null);
    setShowBatchAdd(false);
    setPendingSubjects([{ code: "", name: "", description: "" }]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subjects &mdash; {major.name}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Year</Label>
              <Select
                value={selectedYearId}
                onValueChange={(v) => {
                  setSelectedYearId(v);
                  setSelectedSemesterId("");
                  setSubjectData(null);
                  setShowBatchAdd(false);
                  setPendingSubjects([{ code: "", name: "", description: "" }]);
                }}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id || ""}>
                      {y.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Semester</Label>
              <Select
                value={selectedSemesterId}
                onValueChange={handleSemesterSelect}
                disabled={!selectedYearId}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && subjectData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Subjects ({subjectData.subjects.length})
                </p>
                {!showBatchAdd && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowBatchAdd(true)}
                    className="gap-1 text-xs h-7"
                  >
                    <Plus className="h-3 w-3" />
                    Add Subjects
                  </Button>
                )}
              </div>

              {showBatchAdd && (
                <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground">
                    New subjects (code reuse existing by matching code)
                  </p>

                  <div className="max-h-56 overflow-y-auto space-y-2 p-1">
                    {pendingSubjects.map((ps, i) => (
                      <div
                        key={i}
                        className="flex gap-1.5 items-start border border-border rounded-md p-2 bg-blue-50"
                      >
                        <div className="w-full space-y-2">
                          <div className="grid grid-cols-4 gap-2 w-full">
                            <Input
                              className="bg-background text-sm col-span-2"
                              placeholder="Code *"
                              value={ps.code}
                              onChange={(e) =>
                                updatePending(i, "code", e.target.value)
                              }
                            />
                            <Input
                              className="bg-background text-sm col-span-2"
                              placeholder="Name *"
                              value={ps.name}
                              onChange={(e) =>
                                updatePending(i, "name", e.target.value)
                              }
                            />
                          </div>
                          <Input
                            className="flex-1 bg-background text-sm"
                            placeholder="Description (optional)"
                            value={ps.description}
                            onChange={(e) =>
                              updatePending(i, "description", e.target.value)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/80"
                          onClick={() => removePendingRow(i)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={addPendingRow}
                      className="gap-1 text-xs h-7"
                    >
                      <Plus className="h-3 w-3" />
                      Add another
                    </Button>
                    <div className="flex-1" />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowBatchAdd(false);
                        setPendingSubjects([
                          { code: "", name: "", description: "" },
                        ]);
                      }}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={adding}
                      onClick={handleBatchAdd}
                      className="gap-1 text-xs h-7"
                    >
                      {adding ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3" />
                          Save All (
                          {
                            pendingSubjects.filter(
                              (p) => p.code.trim() && p.name.trim(),
                            ).length
                          }
                          )
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {subjectData.subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No subjects in this semester.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left font-medium">
                          Code
                        </th>
                        <th className="py-2 px-3 text-left font-medium">
                          Name
                        </th>
                        <th className="py-2 px-3 text-left font-medium w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {subjectData.subjects.map((sub) => (
                        <tr key={sub.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3 font-mono text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {sub.code}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-xs">{sub.name}</td>
                          <td className="py-2 px-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/80"
                              onClick={() => handleDeleteSubject(sub.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && !subjectData && selectedSemesterId && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No subject data found for this semester.
            </p>
          )}

          {!loading && !selectedSemesterId && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Select a year and semester to manage subjects.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
