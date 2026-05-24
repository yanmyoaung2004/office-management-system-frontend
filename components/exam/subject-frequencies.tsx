"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { toast } from "sonner";

interface FrequencyRecord {
  id: string;
  intake: string;
  semester: string;
  subject: string;
  subject_code: string;
  subject_name: string;
  frequency: number;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

type SemesterSubjects = Record<string, SubjectItem[]>;
type YearData = Record<string, SemesterSubjects>;
type HierarchyData = Record<string, YearData>;

interface SubjectFrequenciesProps {
  intakeId: string;
  semesterId: string;
  majorName?: string;
  yearName?: string;
  semesterName?: string;
}

export function SubjectFrequencies({
  intakeId,
  semesterId,
  majorName,
  yearName,
  semesterName,
}: SubjectFrequenciesProps) {
  const [frequencies, setFrequencies] = useState<
    {
      subject: string;
      subject_code: string;
      subject_name: string;
      frequency: number;
    }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const { data: hierarchyRes } = useSWR<{
    success: boolean;
    data: HierarchyData;
  }>("/admission/subject-hierarchy", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const hierarchySubjects = useMemo(() => {
    if (!hierarchyRes?.data || !majorName || !yearName || !semesterName)
      return [];
    const byYear = hierarchyRes.data[majorName];
    if (!byYear) return [];
    const bySemester = byYear[yearName];
    if (!bySemester) return [];
    return bySemester[semesterName] ?? [];
  }, [hierarchyRes, majorName, yearName, semesterName]);

  const {
    data: freqRes,
    mutate,
    isLoading,
  } = useSWR<{ success: boolean; data: FrequencyRecord[] }>(
    `/exam/intakes/${intakeId}/semesters/${semesterId}/subject-frequencies/`,
    apiGet,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  useEffect(() => {
    if (hierarchySubjects.length === 0) {
      setFrequencies([]);
      return;
    }
    const freqBySubject = new Map<string, number>();
    if (freqRes?.data) {
      for (const f of freqRes.data) {
        freqBySubject.set(f.subject, f.frequency);
      }
    }
    setFrequencies(
      hierarchySubjects.map((s) => ({
        subject: s.id,
        subject_code: s.code,
        subject_name: s.name,
        frequency: freqBySubject.get(s.id) ?? 0,
      })),
    );
  }, [freqRes, hierarchySubjects]);

  const updateFrequency = (subject: string, value: number) => {
    setFrequencies((prev) =>
      prev.map((r) =>
        r.subject === subject
          ? {
              ...r,
              frequency: Math.max(
                0,
                Math.min(15, Number.isNaN(value) ? 0 : value),
              ),
            }
          : r,
      ),
    );
  };

  const totalFrequency = useMemo(
    () => frequencies.reduce((sum, r) => sum + (r.frequency || 0), 0),
    [frequencies],
  );

  const isValid = totalFrequency <= 15;

  const handleSave = async () => {
    if (!isValid) {
      toast.error(
        `Total frequency (${totalFrequency}) exceeds the maximum of 15`,
      );
      return;
    }
    setSaving(true);
    try {
      const payload = frequencies
        .filter((r) => r.frequency > 0)
        .map((r) => ({
          subject: r.subject,
          frequency: r.frequency,
        }));

      if (payload.length === 0) {
        toast.error(
          "At least one subject must have a frequency greater than 0",
        );
        return;
      }

      await apiPost(
        `/exam/intakes/${intakeId}/semesters/${semesterId}/subject-frequencies/`,
        payload,
      );
      toast.success("Frequencies saved");
      mutate();
    } catch {
      toast.error("Failed to save frequencies");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hierarchySubjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No subjects found for this semester. Ensure subject names in the
        hierarchy match the intake configuration.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Set how many classes per week each subject gets. Total must not exceed
        15.
      </p>

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-2 px-3 font-semibold w-20">Code</th>
              <th className="text-left py-2 px-3 font-semibold">Subject</th>
              <th className="text-center py-2 px-3 font-semibold w-32">
                Classes / Week
              </th>
            </tr>
          </thead>
          <tbody>
            {frequencies.map((row) => (
              <tr
                key={row.subject}
                className="border-b border-border hover:bg-muted/30"
              >
                <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                  {row.subject_code || "—"}
                </td>
                <td className="py-2 px-3">{row.subject_name}</td>
                <td className="py-2 px-3 text-center">
                  <Input
                    type="number"
                    min={0}
                    max={15}
                    value={row.frequency}
                    onChange={(e) =>
                      updateFrequency(
                        row.subject,
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-20 h-8 text-center mx-auto"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Total:</span>
          <span
            className={`text-sm font-bold ${
              isValid ? "text-green-600" : "text-destructive"
            }`}
          >
            {totalFrequency} / 15
          </span>
          {!isValid && (
            <span className="text-xs text-destructive">
              Exceeds maximum of 15
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || frequencies.length === 0}
          className="gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Save Frequencies
        </Button>
      </div>
    </div>
  );
}
