"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterState } from "@/types";
import { apiGet } from "@/lib/api-client";
import { toast } from "sonner";

interface MajorInfo {
  id: string;
  name: string;
}

interface FilterData {
  years: number[];
  majors: MajorInfo[];
  intakes: { id: string; code: string }[];
  yearMajor: Record<string, MajorInfo[]>;
  majorIntakeMap: Record<string, string[]>;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterPanel({
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  const [data, setData] = useState<FilterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [intakes, setIntakes] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiGet(`/filter-data`);
        setData(res as FilterData);
        // console.log(res);
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived state: Get the list of majors for the currently selected year
  const availableMajors =
    data && filters.selectedYear
      ? data.yearMajor[filters.selectedYear.toString()] || []
      : [];

  const handleYearSelect = (year: number) => {
    if (filters.selectedYear === year) {
      onFiltersChange({
        ...filters,
        selectedYear: undefined,
        selectedYearMajor: undefined,
      });
    } else {
      onFiltersChange({
        ...filters,
        selectedYear: year,
        selectedYearMajor: undefined, // Reset major when year changes
      });
    }
  };

  const handleYearMajorSelect = (majorName: string) => {
    onFiltersChange({
      ...filters,
      selectedYearMajor:
        filters.selectedYearMajor === majorName ? undefined : majorName,
    });
  };

  const handleIntakeSelect = (intakeCode: string) => {
    onFiltersChange({
      ...filters,
      selectedIntake:
        filters.selectedIntake === intakeCode ? undefined : intakeCode,
    });
  };

  const handleIntakeMajorSelect = (majorName: string) => {
    setIntakes(data?.majorIntakeMap[majorName] || []);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setSelectedMajor("");
  };

  if (loading || !data)
    return <div className="p-4 text-center">Loading Filters...</div>;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Select year and/or intake to filter student data
            </CardDescription>
          </div>
          {(filters.selectedYear ||
            filters.selectedIntake ||
            filters.selectedYearMajor ||
            selectedMajor) && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Filter */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">By Year</h3>
          <div className="flex flex-wrap gap-2">
            {data.years.map((year) => (
              <Button
                key={year}
                variant={filters.selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </Button>
            ))}
          </div>

          {/* Year Major Filter (Conditional) */}
          {filters.selectedYear && availableMajors.length > 0 && (
            <div className="ml-4 pt-2 border-l-2 border-gray-200 pl-4 space-y-2">
              <p className="text-sm text-gray-600">
                Filter by Major for {filters.selectedYear}
              </p>
              <div className="flex flex-wrap gap-2">
                {availableMajors.map((major) => (
                  <Button
                    key={major.id}
                    variant={
                      filters.selectedYearMajor === major.name
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleYearMajorSelect(major.name)}
                  >
                    {major.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Intake Filter */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">By Intake</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(data?.majorIntakeMap || {}).map((major) => (
              <Button
                key={major}
                variant={selectedMajor === major ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  if (
                    filters.selectedYearMajor &&
                    filters.selectedYearMajor !== major
                  ) {
                    toast.error(
                      "Please clear the Year Major filter before selecting an Intake Major.",
                    );

                    return;
                  }
                  setSelectedMajor(major === selectedMajor ? "" : major);
                  handleIntakeMajorSelect(major);
                }}
              >
                {major}
              </Button>
            ))}
          </div>
          {selectedMajor && (
            <div className="ml-4 pt-2 border-l-2 border-gray-200 pl-4 space-y-2">
              <p className="text-sm text-gray-600">
                Filter by Intake for {selectedMajor}
              </p>
              <div className="flex flex-wrap gap-2">
                {intakes.map((intake) => (
                  <Button
                    key={intake}
                    variant={
                      filters.selectedIntake === intake ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleIntakeSelect(intake)}
                  >
                    {intake}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
