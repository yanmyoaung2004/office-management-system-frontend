"use client";

import { useMemo, useState, useCallback } from "react";
import useSWR from "swr";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { Loader2, Search, ChevronDown, ChevronRight, X } from "lucide-react";

import { apiGet } from "@/lib/api-client";

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

type SemesterSubjects = Record<string, SubjectItem[]>;
type YearData = Record<string, SemesterSubjects>;
type HierarchyData = Record<string, YearData>;

interface SubjectHierarchySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function SubjectHierarchySelector({
  selectedIds,
  onChange,
}: SubjectHierarchySelectorProps) {
  const [search, setSearch] = useState("");

  const [expandedMajors, setExpandedMajors] = useState<Set<string>>(
    () => new Set(),
  );

  const [expandedYears, setExpandedYears] = useState<Set<string>>(
    () => new Set(),
  );

  const { data, isLoading } = useSWR<{ success: boolean; data: HierarchyData }>(
    "/admission/subject-hierarchy",
    apiGet,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const hierarchy = data?.data;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allSubjects = useMemo(() => {
    if (!hierarchy) return [];

    const seen = new Set<string>();
    const subjects: SubjectItem[] = [];

    for (const major of Object.values(hierarchy)) {
      for (const year of Object.values(major)) {
        for (const semester of Object.values(year)) {
          for (const subject of semester) {
            if (seen.has(subject.id)) continue;

            seen.add(subject.id);
            subjects.push(subject);
          }
        }
      }
    }

    return subjects;
  }, [hierarchy]);

  const selectedSubjects = useMemo(
    () => allSubjects.filter((s) => selectedSet.has(s.id)),
    [allSubjects, selectedSet],
  );

  const filteredHierarchy = useMemo(() => {
    if (!hierarchy) return {};

    const query = search.trim().toLowerCase();

    if (!query) return hierarchy;

    const result: HierarchyData = {};

    for (const [majorName, years] of Object.entries(hierarchy)) {
      const matchedYears: YearData = {};

      for (const [yearName, semesters] of Object.entries(years)) {
        const matchedSemesters: SemesterSubjects = {};

        for (const [semesterName, subjects] of Object.entries(semesters)) {
          const matchedSubjects = subjects.filter((subject) => {
            return (
              subject.name.toLowerCase().includes(query) ||
              subject.code.toLowerCase().includes(query) ||
              majorName.toLowerCase().includes(query) ||
              yearName.toLowerCase().includes(query) ||
              semesterName.toLowerCase().includes(query)
            );
          });

          if (matchedSubjects.length > 0) {
            matchedSemesters[semesterName] = matchedSubjects;
          }
        }

        if (Object.keys(matchedSemesters).length > 0) {
          matchedYears[yearName] = matchedSemesters;
        }
      }

      if (Object.keys(matchedYears).length > 0) {
        result[majorName] = matchedYears;
      }
    }

    return result;
  }, [hierarchy, search]);

  const toggleSubject = useCallback(
    (subjectId: string) => {
      if (selectedSet.has(subjectId)) {
        onChange(selectedIds.filter((id) => id !== subjectId));
      } else {
        onChange([...selectedIds, subjectId]);
      }
    },
    [selectedIds, selectedSet, onChange],
  );

  const toggleMajor = useCallback((majorName: string) => {
    setExpandedMajors((prev) => {
      const next = new Set(prev);

      if (next.has(majorName)) {
        next.delete(majorName);
      } else {
        next.add(majorName);
      }

      return next;
    });
  }, []);

  const toggleYear = useCallback((yearKey: string) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);

      if (next.has(yearKey)) {
        next.delete(yearKey);
      } else {
        next.add(yearKey);
      }

      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedSubjects.map((subject) => (
            <Badge key={subject.id} variant="secondary" className="gap-1 pr-1">
              {subject.code} - {subject.name}
              <button
                type="button"
                onClick={() => toggleSubject(subject.id)}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Search subjects, majors, years or semesters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
        {Object.keys(filteredHierarchy).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No subjects found
          </p>
        ) : (
          Object.entries(filteredHierarchy).map(([majorName, years]) => {
            const isMajorExpanded = expandedMajors.has(majorName);

            return (
              <div key={majorName}>
                <button
                  type="button"
                  onClick={() => toggleMajor(majorName)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-sm font-semibold hover:bg-muted"
                >
                  {isMajorExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}

                  {majorName}
                </button>

                {isMajorExpanded && (
                  <div className="ml-3 space-y-1">
                    {Object.entries(years).map(([yearName, semesters]) => {
                      const yearKey = `${majorName}|${yearName}`;

                      const isYearExpanded = expandedYears.has(yearKey);

                      return (
                        <div key={yearKey}>
                          <button
                            type="button"
                            onClick={() => toggleYear(yearKey)}
                            className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            {isYearExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}

                            {yearName}
                          </button>

                          {isYearExpanded && (
                            <div className="ml-3 space-y-2">
                              {Object.entries(semesters).map(
                                ([semesterName, subjects]) => (
                                  <div key={semesterName}>
                                    <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                                      {semesterName}
                                    </p>

                                    <div className="space-y-0.5">
                                      {subjects.map((subject) => (
                                        <label
                                          key={subject.id}
                                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                                        >
                                          <Checkbox
                                            checked={selectedSet.has(
                                              subject.id,
                                            )}
                                            onCheckedChange={() =>
                                              toggleSubject(subject.id)
                                            }
                                          />

                                          <span className="font-mono text-xs text-muted-foreground">
                                            {subject.code}
                                          </span>

                                          <span>{subject.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
