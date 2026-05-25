"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import type { Major, Year } from "@/types";
import type { IntakeFormValues } from "@/schemas/intake";

interface IntakeSemesterFieldProps {
  form: UseFormReturn<IntakeFormValues>;
  majors: Major[];
}

export function IntakeSemesterField({ form, majors }: IntakeSemesterFieldProps) {
  const majorId = form.watch("majorId");

  const years: Year[] = useMemo(
    () => majors.find((m) => m.id === majorId)?.years ?? [],
    [majors, majorId],
  );

  return (
    <FormField
      control={form.control}
      name="currentSemId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Current Semester
            <span className="text-destructive ml-0.5">*</span>
          </FormLabel>
          <FormControl>
            <select
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
            >
              <option value="">Select Semester</option>
              {years.map((y) => (
                <optgroup key={y.id ?? "year-group"} label={y.name}>
                  {(y.semesters ?? []).map((s) => (
                    <option key={s.id} value={s.id ?? ""}>
                      {`${y.name} - ${s.name}`}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
