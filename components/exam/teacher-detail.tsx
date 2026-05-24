"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Loader2, Save, User } from "lucide-react";

import { apiGet, apiPost } from "@/lib/api-client";
import { toast } from "sonner";

interface SubjectDisplay {
  id: string;
  code: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  subject_ids: string[];
  subjects_display: SubjectDisplay[];
  created_at: string;
  updated_at: string;
}

interface AvailabilitySlot {
  id?: string;
  teacher: string;
  day_of_week: number;
  slot: "9-11" | "12-2" | "2-4";
  is_available: boolean;

  intake: string | null;
  subject: string | null;
}

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

const SLOT_LABELS: Record<AvailabilitySlot["slot"], string> = {
  "9-11": "9:00 – 11:00",
  "12-2": "12:00 – 2:00",
  "2-4": "2:00 – 4:00",
};

const SLOTS: AvailabilitySlot["slot"][] = ["9-11", "12-2", "2-4"];

const DAYS = [1, 2, 3, 4, 5];

interface TeacherDetailProps {
  teacherId: string;
}

function createDefaultAvailabilities(teacherId: string): AvailabilitySlot[] {
  const defaults: AvailabilitySlot[] = [];

  for (const day of DAYS) {
    for (const slot of SLOTS) {
      defaults.push({
        teacher: teacherId,
        day_of_week: day,
        slot,
        is_available: false,
        intake: null,
        subject: null,
      });
    }
  }

  return defaults;
}

export function TeacherDetail({ teacherId }: TeacherDetailProps) {
  const router = useRouter();

  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);

  const [saving, setSaving] = useState(false);

  const { data: teacherRes, isLoading: teacherLoading } = useSWR<{
    success: boolean;
    data: Teacher;
  }>(`/exam/teachers/${teacherId}/`, apiGet, {
    revalidateOnFocus: false,
  });

  const {
    data: availRes,
    isLoading: availabilityLoading,
    mutate: mutateAvail,
  } = useSWR<{
    success: boolean;
    data: AvailabilitySlot[];
  }>(`/exam/teachers/${teacherId}/availability/`, apiGet, {
    revalidateOnFocus: false,
  });

  const teacher = teacherRes?.data;

  useEffect(() => {
    if (availabilityLoading) return;

    if (availRes?.data?.length) {
      setAvailabilities(availRes.data);
      return;
    }

    setAvailabilities(createDefaultAvailabilities(teacherId));
  }, [availabilityLoading, availRes, teacherId]);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailabilitySlot>();

    for (const availability of availabilities) {
      const key = `${availability.day_of_week}-${availability.slot}`;

      map.set(key, availability);
    }

    return map;
  }, [availabilities]);

  const getAvailability = useCallback(
    (day: number, slot: AvailabilitySlot["slot"]) => {
      return availabilityMap.get(`${day}-${slot}`);
    },
    [availabilityMap],
  );

  const toggleSlot = useCallback(
    (day: number, slot: AvailabilitySlot["slot"]) => {
      setAvailabilities((prev) =>
        prev.map((availability) => {
          if (availability.day_of_week !== day || availability.slot !== slot) {
            return availability;
          }

          const nextAvailable = !availability.is_available;

          return {
            ...availability,
            is_available: nextAvailable,

            // Clear scheduling metadata
            // when becoming available
            intake: nextAvailable ? null : availability.intake,

            subject: nextAvailable ? null : availability.subject,
          };
        }),
      );
    },
    [],
  );

  const handleSaveAvailability = async () => {
    setSaving(true);

    try {
      await apiPost(`/exam/teachers/${teacherId}/availability/`, {
        availabilities,
      });

      toast.success("Availability saved successfully");

      mutateAvail();
    } catch (error) {
      console.error(error);

      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  if (teacherLoading || availabilityLoading || !teacher) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/exam/teachers")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Teachers
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-1">
              <div>{teacher.name}</div>

              <div className="text-sm font-normal text-muted-foreground">
                {teacher.email || "No email"}
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Phone</p>

              <p className="text-sm font-medium">{teacher.phone_number}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-muted-foreground">Email</p>

              <p className="text-sm font-medium">{teacher.email || "-"}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-muted-foreground">Subjects</p>

              <div className="flex flex-wrap gap-1">
                {teacher.subjects_display.length === 0 ? (
                  <span className="text-sm text-muted-foreground">None</span>
                ) : (
                  teacher.subjects_display.map((subject) => (
                    <Badge
                      key={subject.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {subject.code} - {subject.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Teacher Availability Schedule</span>

            <Button
              onClick={handleSaveAvailability}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="w-32 px-3 py-3 text-left font-semibold text-muted-foreground">
                    Time Slot
                  </th>

                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-3 py-3 text-center font-semibold"
                    >
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {SLOTS.map((slot) => (
                  <tr key={slot} className="border-b last:border-b-0">
                    <td className="px-3 py-3 align-top text-sm font-medium text-muted-foreground">
                      {SLOT_LABELS[slot]}
                    </td>

                    {DAYS.map((day) => {
                      const availability = getAvailability(day, slot);

                      const available = availability?.is_available ?? false;

                      const intakeName = availability?.intake;

                      const subjectCode = availability?.subject;

                      return (
                        <td key={day} className="p-2 align-top">
                          <button
                            type="button"
                            onClick={() => toggleSlot(day, slot)}
                            className={`h-full min-h-12 w-full rounded-lg border p-3 text-left transition-colors ${
                              available
                                ? `
                                  border-green-200
                                  bg-green-100
                                  hover:bg-green-200
                                  dark:border-green-800
                                  dark:bg-green-900/30
                                `
                                : `
                                  border-border
                                  bg-muted
                                  hover:bg-muted/80
                                `
                            }`}
                          >
                            {available ? (
                              <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-green-700 dark:text-green-400">
                                    Available
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="text-xs text-center font-semibold text-foreground">
                                  {intakeName} {subjectCode}
                                </div>
                                <div className="text-[10px] text-center text-muted-foreground">
                                  Unavailable
                                </div>
                              </div>
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

          <div className="mt-4 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Click a slot to toggle teacher availability. Occupied slots display
            assigned intake and subject information.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
