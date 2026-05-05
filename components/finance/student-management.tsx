"use client";
import { useState } from "react";
import type { Student } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { ConfirmationPopup } from "../confirmation-popup";
import { searchStudentsFinance } from "@/lib/search-utils";

const ITEMS_PER_PAGE = 6;

interface StudentManagementProps {
  students: Student[];
  onUpdateStudent: (studentId: string) => void;
}

export function FinanceStudentManagement({
  students,
  onUpdateStudent,
}: StudentManagementProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStudents = searchStudentsFinance(students, searchQuery);
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          {/* <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Major
          </Button> */}
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
          <CardTitle>All Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">
                    Full Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Student Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Parent Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Major Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Current Semester
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium">
                        {student.fullName}
                      </td>
                      <td className="py-3 px-4">{student.studentPhoneNo}</td>
                      <td className="py-3 px-4">{student.parentPhoneNo}</td>
                      <td className="py-3 px-4">{student.majorName}</td>
                      <td className="py-3 px-4">{student.currentStatus}</td>
                      <td className="py-3 px-4">
                        <ConfirmationPopup
                          itemId={student.id}
                          onAllow={() => {
                            onUpdateStudent(student.id);
                          }}
                          onCancel={() => {}}
                          onButtonText=""
                          onButtonVariant="ghost"
                          onAllowButtonText="Allow"
                          onCancelButtonText="Don't allow"
                          primaryText="Allow to delete?"
                          description="Do you want to allow this student to be deleted permanently?"
                          buttonIcon={Trash2}
                          buttonClass={
                            "text-destructive hover:bg-destructive/80"
                          }
                          iconClass="h-4 w-4"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No majors created
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
