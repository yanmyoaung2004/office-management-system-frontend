"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Year, Semester } from "@/types";

interface YearSemesterBuilderProps {
  value: Year[];
  onChange: (years: Year[]) => void;
}

export function YearSemesterBuilder({ value, onChange }: YearSemesterBuilderProps) {
  const years = value;

  const nextYearNumber = () =>
    years.filter((y) => y.type === "NORMAL").length + 1;

  const addYear = () => {
    const hasFoundation = years.some((y) => y.type === "FOUNDATION");
    if (!hasFoundation) {
      onChange([
        ...years,
        {
          id: null,
          type: "FOUNDATION",
          yearNumber: null,
          name: "Foundation",
          semesters: [],
        } as Year,
      ]);
      return;
    }

    const yearNumber = nextYearNumber();
    onChange([
      ...years,
      {
        id: null,
        type: "NORMAL",
        yearNumber,
        name: `Year ${yearNumber}`,
        semesters: [],
      } as Year,
    ]);
  };

  const updateYearName = (index: number, name: string) => {
    onChange(years.map((y, i) => (i === index ? { ...y, name } : y)));
  };

  const removeYear = (index: number) => {
    onChange(years.filter((_, i) => i !== index));
  };

  const addSemester = (yearIndex: number) => {
    onChange(
      years.map((y, i) =>
        i === yearIndex
          ? {
              ...y,
              semesters: [
                ...y.semesters,
                {
                  id: "",
                  semesterNumber: y.semesters.length + 1,
                  name: `Semester ${y.semesters.length + 1}`,
                } as Semester,
              ],
            }
          : y,
      ),
    );
  };

  const updateSemesterName = (yearIndex: number, semIndex: number, name: string) => {
    onChange(
      years.map((y, i) =>
        i === yearIndex
          ? {
              ...y,
              semesters: y.semesters.map((s, j) =>
                j === semIndex ? { ...s, name } : s,
              ),
            }
          : y,
      ),
    );
  };

  const removeSemester = (yearIndex: number, semIndex: number) => {
    onChange(
      years.map((y, i) =>
        i === yearIndex
          ? { ...y, semesters: y.semesters.filter((_, j) => j !== semIndex) }
          : y,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {years.map((year, yearIndex) => (
        <div key={yearIndex} className="border border-border rounded-md p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={year.name}
              onChange={(e) => updateYearName(yearIndex, e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md bg-card text-sm font-medium"
            />
            <button
              type="button"
              onClick={() => removeYear(yearIndex)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {year.semesters.map((sem, semIndex) => (
              <div key={semIndex} className="relative group">
                <input
                  type="text"
                  value={sem.name}
                  onChange={(e) => updateSemesterName(yearIndex, semIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => removeSemester(yearIndex, semIndex)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addSemester(yearIndex)}
            className="flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            <Plus size={14} />
            Add Semester
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addYear}
        className="flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
      >
        <Plus size={14} />
        Add Year
      </button>
    </div>
  );
}
