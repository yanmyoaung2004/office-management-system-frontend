"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";
import { LocationData, MajorData } from "./dashboard";

interface ChartsSectionProps {
  majorData: MajorData[];
  locationData: LocationData[];
  title?: string;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

export default function ChartsSection({
  majorData,
  locationData,
}: ChartsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Enrollment by Major */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment by Major</CardTitle>
            <CardDescription>Distribution of enrolled students</CardDescription>
          </CardHeader>
          <CardContent>
            {majorData.length > 0 ? (
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={majorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // FIX: Access custom data via the payload property
                      label={(props: PieLabelRenderProps) => {
                        const { payload } = props;
                        return `${payload.major}: ${payload.totalEnrolled}`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalEnrolled"
                    >
                      {majorData.map((_, index) => (
                        <Cell
                          key={`cell-major-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-75 text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Student Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment by Location</CardTitle>
            <CardDescription>
              Distribution of enrollments across cities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locationData.length > 0 ? (
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // FIX: Access custom data via the payload property
                      label={(props: PieLabelRenderProps) => {
                        const { payload } = props;
                        return `${payload.location}: ${payload.value}`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {locationData.map((_, index) => (
                        <Cell
                          key={`cell-location-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-75 text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Student Location Distribution */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              Distribution of enrollments across cities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locationData.length > 0 ? (
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // FIX: Access custom data via the payload property
                      label={(props: PieLabelRenderProps) => {
                        const { payload } = props;
                        return `${payload.location}: ${payload.value}`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {locationData.map((_, index) => (
                        <Cell
                          key={`cell-location-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-75 text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
