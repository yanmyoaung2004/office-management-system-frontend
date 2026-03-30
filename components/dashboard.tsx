"use client";

import type { Student, Major, Intake, UserRole, FilterState } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import FilterPanel from "./FilterPanel";
import { useEffect, useState } from "react";
import ChartsSection from "./ChartsSection";
import { apiGet } from "@/lib/api-client";

interface DashboardProps {
  students: Student[];
  majors: Major[];
  intakes: Intake[];
  currentRole: UserRole;
}

export interface LocationData {
  location: string;
  value: number;
}
export interface MajorData {
  major: string;
  value: number;
}
type ChartDataResponse = {
  majorData: MajorData[];
  locationData: LocationData[];
};

export function Dashboard({ students, majors }: DashboardProps) {
  // Calculate stats
  const totalStudents = students.length;
  const totalEnrolled = students.filter((s) => s.status === "Enrolled").length;
  const totalDropouts = students.filter((s) => s.status === "Dropout").length;
  const totalInterrupted = students.filter(
    (s) => s.status === "Interrupted",
  ).length;
  const totalGraduated = students.filter(
    (s) => s.status === "Graduated",
  ).length;

  // Students by major
  const studentsByMajor = majors.map((major) => ({
    name: major.code,
    value: students.filter((s) => s.majorName === major.name).length,
  }));
  const colors = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];
  const [filters, setFilters] = useState<FilterState>({});
  const [chartData, setChartData] = useState<ChartDataResponse>({
    majorData: [],
    locationData: [],
  });

  // Create descriptive title based on filters
  const getTitle = () => {
    const parts = [];
    if (filters.selectedYear) {
      parts.push(`Year ${filters.selectedYear}`);
    }
    if (filters.selectedYearMajor && filters.selectedYearMajor !== "total") {
      parts.push(filters.selectedYearMajor);
    }
    if (filters.selectedIntake) {
      parts.push(`Intake: ${filters.selectedIntake}`);
    }
    return parts.length > 0 ? parts.join(" - ") : "All Data";
  };

  useEffect(() => {
    const query = new URLSearchParams({
      selectedYear: filters.selectedYear ? String(filters.selectedYear) : "",
      selectedYearMajor: filters.selectedYearMajor || "",
      selectedIntake: filters.selectedIntake || "",
    }).toString();

    const fetchData = async () => {
      const res = (await apiGet(`/chart-data?${query}`)) as ChartDataResponse;
      setChartData({
        majorData: res.majorData,
        locationData: res.locationData,
      });
    };
    fetchData();
  }, [filters.selectedYear, filters.selectedYearMajor, filters.selectedIntake]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg shadow p-4">
          <div className="pb-0">
            <div className="text-sm font-medium text-muted-foreground">
              Total Students
            </div>
          </div>
          <div className="pt-3 ">
            <div className="text-3xl font-bold text-primary">
              {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All registrations
            </p>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow p-4">
          <div className="pb-0">
            <div className="text-sm font-medium text-muted-foreground">
              Enrolled
            </div>
          </div>
          <div className="pt-3">
            <div className="text-3xl font-bold text-accent">
              {totalEnrolled}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active students
            </p>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow p-4">
          <div className="pb-0">
            <div className="text-sm font-medium text-muted-foreground">
              Graduated
            </div>
          </div>
          <div className="pt-3 ">
            <div className="text-3xl font-bold text-emerald-600">
              {totalGraduated}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow p-4">
          <div className="pb-0">
            <div className="text-sm font-medium text-muted-foreground">
              Interrupt
            </div>
          </div>
          <div className="pt-3 ">
            <div className="text-3xl font-bold text-destructive">
              {totalInterrupted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Discontinued</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow p-4">
          <div className="pb-0">
            <div className="text-sm font-medium text-muted-foreground">
              Dropouts
            </div>
          </div>
          <div className="pt-3 ">
            <div className="text-3xl font-bold text-destructive">
              {totalDropouts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Discontinued</p>
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students per Major</CardTitle>
            <CardDescription>Distribution across programs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsByMajor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  allowDecimals={false}
                  tickCount={
                    Math.max(...studentsByMajor.map((d) => d.value)) + 1
                  }
                />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Status Distribution</CardTitle>
            <CardDescription>Current enrollment status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Enrolled", value: totalEnrolled },
                    { name: "Graduated", value: totalGraduated },
                    { name: "Dropped", value: totalDropouts },
                    {
                      name: "Interrupted",
                      value: students.filter((s) => s.status === "Interrupted")
                        .length,
                    },
                  ].filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </div>
      <div>
        <Card className="mb-6 p-6">
          <h2 className="text-2xl font-semibold text-gray-800">{getTitle()}</h2>
        </Card>

        {/* Charts */}
        {chartData ? (
          <ChartsSection
            majorData={chartData.majorData}
            locationData={chartData.locationData}
            title={getTitle()}
          />
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              Select filters above to view student data and analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
