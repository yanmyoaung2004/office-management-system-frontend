"use client";

import { useState, useMemo, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { Major, Year } from "@/types";
import type { IntakeFormValues } from "@/schemas/intake";

interface IntakeScheduleFieldProps {
  form: UseFormReturn<IntakeFormValues>;
  majors: Major[];
  majorId: string;
}

interface ScheduleEntry {
  semester_id: string;
  start_date: string;
  end_date: string;
}

function buildScheduleMap(
  existing: { semester_id?: string; start_date?: string; end_date?: string }[] | undefined,
): Record<string, { start_date: string; end_date: string }> {
  if (!existing || existing.length === 0) return {};
  const map: Record<string, { start_date: string; end_date: string }> = {};
  for (const s of existing) {
    if (s.semester_id) {
      map[s.semester_id] = {
        start_date: s.start_date ?? "",
        end_date: s.end_date ?? "",
      };
    }
  }
  return map;
}

export function IntakeScheduleField({ form, majors, majorId }: IntakeScheduleFieldProps) {
  const [scheduleData, setScheduleData] = useState<
    Record<string, { start_date: string; end_date: string }>
  >(() => {
    const existing = form.getValues("semester_schedules");
    if (!existing || existing.length === 0) return {};
    const related = majors
      .find((m) => m.id === majorId)
      ?.years.flatMap((y) => y.semesters ?? [])
      .map((s) => s.id);
    return buildScheduleMap(
      existing.filter(
        (s) => s.semester_id && related?.includes(s.semester_id),
      ),
    );
  });

  const syncForm = useCallback(
    (data: Record<string, { start_date: string; end_date: string }>) => {
      const schedules: ScheduleEntry[] = Object.entries(data).map(
        ([semester_id, dates]) => ({
          semester_id,
          start_date: dates.start_date,
          end_date: dates.end_date,
        }),
      );
      form.setValue("semester_schedules", schedules, {
        shouldValidate: false,
      });
    },
    [form],
  );

  const years: Year[] = useMemo(
    () => majors.find((m) => m.id === majorId)?.years ?? [],
    [majors, majorId],
  );

  const handleDateChange = useCallback(
    (
      semesterId: string,
      field: "start_date" | "end_date",
      value: string,
    ) => {
      setScheduleData((prev) => {
        const next = {
          ...prev,
          [semesterId]: {
            ...(prev[semesterId] ?? { start_date: "", end_date: "" }),
            [field]: value,
          },
        };
        syncForm(next);
        return next;
      });
    },
    [syncForm],
  );

  if (years.length === 0) return null;

  return (
    <div className="space-y-6">
      {years.map((y) => (
        <div
          key={y.id ?? "year"}
          className="p-4 border rounded-lg bg-muted/50"
        >
          <h4 className="text-md font-bold mb-4 uppercase tracking-wide">
            {y.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(y.semesters ?? []).map((s) => (
              <div
                key={s.id ?? `sem-${Math.random()}`}
                className="bg-card p-3 rounded border shadow-sm"
              >
                <p className="text-sm font-semibold mb-3 border-l-4 border-primary/90 pl-2">
                  {s.name}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-medium text-muted-foreground w-20">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={
                        s.id != null
                          ? scheduleData[s.id]?.start_date ?? ""
                          : ""
                      }
                      onChange={(e) =>
                        s.id != null &&
                        handleDateChange(s.id, "start_date", e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-medium text-muted-foreground w-20">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={
                        s.id != null
                          ? scheduleData[s.id]?.end_date ?? ""
                          : ""
                      }
                      onChange={(e) =>
                        s.id != null &&
                        handleDateChange(s.id, "end_date", e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
