"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { toast } from "sonner";

interface SlotEntry {
  slot: string;
  subject_code: string | null;
  subject_name: string | null;
  teacher_name: string | null;
}

interface DayEntry {
  day: number;
  day_label: string;
  slots: SlotEntry[];
}

interface TimetableData {
  intake: string;
  semester: string;
  timetable: DayEntry[];
}

interface TimetableResponse {
  success: boolean;
  data: TimetableData;
}

interface GenerateResponse {
  success: boolean;
  data: TimetableData;
  message?: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface FrequencyRecord {
  id: string;
  subject: string;
  subject_code: string;
  subject_name: string;
  frequency: number;
}

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

const SLOT_LABELS: Record<string, string> = {
  "9-11": "9:00 – 11:00",
  "12-2": "12:00 – 2:00",
  "2-4": "2:00 – 4:00",
};

const SLOTS = ["9-11", "12-2", "2-4"];
const DAYS = [1, 2, 3, 4, 5];

interface TimetableViewProps {
  intakeId: string;
  semesterId: string;
}

export function TimetableView({ intakeId, semesterId }: TimetableViewProps) {
  const [generateErrors, setGenerateErrors] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [editSlot, setEditSlot] = useState<{
    day: number;
    slot: string;
  } | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [savingSlot, setSavingSlot] = useState(false);

  const {
    data: timetableRes,
    mutate: mutateTimetable,
    isLoading: loadingTimetable,
  } = useSWR<TimetableResponse>(
    `/exam/intakes/${intakeId}/semesters/${semesterId}/timetable/`,
    apiGet,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  const { data: teachersRes } = useSWR<{ success: boolean; data: Teacher[] }>(
    "/exam/teachers/",
    apiGet,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const { data: freqRes } = useSWR<{
    success: boolean;
    data: FrequencyRecord[];
  }>(
    `/exam/intakes/${intakeId}/semesters/${semesterId}/subject-frequencies/`,
    apiGet,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const teachers = teachersRes?.data ?? [];
  const subjects = freqRes?.data ?? [];

  const timetable = timetableRes?.data?.timetable;

  const getSlot = (day: number, slot: string) => {
    return timetable
      ?.find((d) => d.day === day)
      ?.slots.find((s) => s.slot === slot);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateErrors([]);
    try {
      const res = await apiPost<GenerateResponse>(
        `/exam/intakes/${intakeId}/semesters/${semesterId}/timetable/generate/`,
      );
      toast.success(res.message || "Timetable generated");
      mutateTimetable();
    } catch (err: unknown) {
      const apiErr = err as { status?: number; code?: string; message?: string };
      const errors: string[] = [];
      if (apiErr.message) {
        if (apiErr.message.startsWith("[")) {
          try {
            const parsed = JSON.parse(apiErr.message);
            if (Array.isArray(parsed)) errors.push(...parsed);
          } catch {
            errors.push(apiErr.message);
          }
        } else {
          errors.push(apiErr.message);
        }
      }
      if (errors.length > 0) {
        setGenerateErrors(errors);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await apiDelete(
        `/exam/intakes/${intakeId}/semesters/${semesterId}/timetable/`,
      );
      toast.success("Timetable cleared");
      setGenerateErrors([]);
      mutateTimetable();
    } catch {
      toast.error("Failed to clear timetable");
    } finally {
      setClearing(false);
    }
  };

  const openEditDialog = (day: number, slot: string) => {
    const current = getSlot(day, slot);
    const subjectMatch = subjects.find(
      (s) => s.subject_code === current?.subject_code,
    );
    const teacherMatch = teachers.find((t) => t.name === current?.teacher_name);

    setEditSubject(subjectMatch?.subject ?? "");
    setEditTeacher(teacherMatch?.id ?? "");
    setEditSlot({ day, slot });
  };

  const handleSaveSlot = async () => {
    if (!editSlot) return;
    setSavingSlot(true);
    try {
      await apiPut(
        `/exam/intakes/${intakeId}/semesters/${semesterId}/timetable/`,
        {
          day_of_week: editSlot.day,
          slot: editSlot.slot,
          subject: editSubject,
          teacher: editTeacher,
        },
      );
      toast.success("Slot updated");
      setEditSlot(null);
      mutateTimetable();
    } catch {
      toast.error("Failed to update slot");
    } finally {
      setSavingSlot(false);
    }
  };

  const hasTimetable = timetable && timetable.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </Button>
          <Button
            variant="outline"
            onClick={() => mutateTimetable()}
            disabled={loadingTimetable}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingTimetable ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClear}
            disabled={clearing || !hasTimetable}
            className="gap-2"
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Clear
          </Button>
        </div>
      </div>

      {generateErrors.length > 0 && (
        <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 rounded-md p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-red-800 dark:text-red-300 mb-1">
            <AlertCircle className="h-4 w-4" />
            Timetable generation failed
          </div>
          <ul className="space-y-1 ml-6">
            {generateErrors.map((err, i) => (
              <li
                key={i}
                className="text-xs text-red-700 dark:text-red-400 list-disc"
              >
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {loadingTimetable ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !hasTimetable ? (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">
            No timetable generated yet. Click &quot;Generate&quot; to create
            one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-2.5 px-3 text-left font-semibold w-24">
                  Slot
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="py-2.5 px-3 text-center font-semibold"
                  >
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot}>
                  <td className="py-2.5 px-3 text-sm font-medium text-muted-foreground border-r">
                    {SLOT_LABELS[slot]}
                  </td>
                  {DAYS.map((day) => {
                    const entry = getSlot(day, slot);
                    const isOccupied =
                      entry?.subject_code && entry?.teacher_name;
                    return (
                      <td
                        key={day}
                        className="py-2 px-2 text-center border-r last:border-r-0"
                      >
                        <button
                          type="button"
                          onClick={() => openEditDialog(day, slot)}
                          className={`w-full min-h-16 rounded-md p-2 text-xs transition-colors ${
                            isOccupied
                              ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                              : "bg-muted/30 hover:bg-muted/60 border border-transparent"
                          }`}
                        >
                          {isOccupied ? (
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground leading-tight">
                                {entry.subject_code}
                              </p>
                              <p className="text-[10px] text-muted-foreground leading-tight">
                                {entry.subject_name}
                              </p>
                              <p className="text-[10px] text-primary leading-tight">
                                {entry.teacher_name}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">
                              Empty
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={editSlot !== null}
        onOpenChange={(open) => {
          if (!open) setEditSlot(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
            <DialogDescription>
              {editSlot
                ? `${DAY_LABELS[editSlot.day]} - ${SLOT_LABELS[editSlot.slot]}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject</Label>
              <Select value={editSubject} onValueChange={setEditSubject}>
                <SelectTrigger id="edit-subject">
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      No subjects with frequencies
                    </SelectItem>
                  )}
                  {subjects.map((s) => (
                    <SelectItem key={s.subject} value={s.subject}>
                      {s.subject_code} - {s.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-teacher">Teacher</Label>
              <Select value={editTeacher} onValueChange={setEditTeacher}>
                <SelectTrigger id="edit-teacher">
                  <SelectValue placeholder="Select teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      No teachers available
                    </SelectItem>
                  )}
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditSlot(null)}
                disabled={savingSlot}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSlot}
                disabled={savingSlot || !editSubject || !editTeacher}
              >
                {savingSlot && (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
