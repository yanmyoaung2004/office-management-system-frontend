"use client";
import { useState } from "react";
import type { Intake } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/pagination";
import { searchIntakes } from "@/lib/search-utils";

const ITEMS_PER_PAGE = 6;

interface IntakeManagementProps {
  intakes: Intake[];
}

export function FinanceIntakeManagement({ intakes }: IntakeManagementProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  console.log(intakes);

  const filteredIntakes = searchIntakes(intakes, searchQuery);
  const totalPages = Math.ceil(filteredIntakes.length / ITEMS_PER_PAGE);
  const paginatedIntakes = filteredIntakes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search by name, code, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white text-sm"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Intakes ({intakes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Code</th>
                  <th className="text-left py-3 px-4 font-semibold">Major</th>
                  <th className="text-left py-3 px-4 font-semibold">Year</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Start Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Current Semester
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedIntakes.length > 0 ? (
                  paginatedIntakes.map((intake) => (
                    <tr
                      key={intake.id}
                      className="border-b border-border hover:bg-muted/50 select-none touch-manipulation"
                      onClick={() => {
                        // handleDoubleClickFallback(intake.id);
                      }}
                    >
                      <td className="py-3 px-4 font-medium">{intake.code}</td>
                      <td className="py-3 px-4">{intake.majorName}</td>
                      <td className="py-3 px-4">{intake.year}</td>
                      <td className="py-3 px-4">{intake.startDate}</td>
                      <td className="py-3 px-4">{intake.currentStatus}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No intakes created
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-6 border-t border-border pt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
