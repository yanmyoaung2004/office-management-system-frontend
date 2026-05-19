"use client";

import { useState } from "react";
import type { ExamSchedule, Intake } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2, Eye } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { searchExam } from "@/lib/search-utils";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import { ConfirmationPopup } from "@/components/confirmation-popup";
import { apiDelete } from "@/lib/api-client";
import { toast } from "sonner";
import { usePermission } from "@/hooks/usePermission";
import ExamForm from "@/components/exam/exam-form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 6;
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000,
};

export default function Page() {
  const { user, isLoading } = useAuth();
  const { hasPermission } = usePermission();
  const currentRole = user?.role;
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showFormEdit, setShowFormEdit] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<ExamSchedule | null>(null);

  const { data: intakesResponse } = useSWR<PaginatedResponse<Intake>>(
    currentRole !== "staff" ? "/exam/intakes-semester?page=1&limit=200" : null,
    swrOptions,
  );
  const { data: examsResponse, mutate: mutateExams } = useSWR<
    PaginatedResponse<ExamSchedule>
  >(
    currentRole !== "staff" ? "/exam/exams?page=1&limit=200" : null,
    swrOptions,
  );

  const intakes = intakesResponse?.data ?? [];
  const exams = examsResponse?.data ?? [];

  // pagination and search
  const filteredMajors = searchExam(exams, searchQuery);
  const totalPages = Math.ceil(filteredMajors.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredMajors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleOnClose = () => {
    setShowForm(false);
    setShowFormEdit(false);
    setSelectedExam(null);
    mutateExams();
  };

  const onDeleteExam = async (id: string) => {
    if (hasPermission("delete_exam")) {
      const res: { success: boolean; message: string; error: string } =
        await apiDelete(`/exam/exams/${id}`);
      if (res.success) {
        toast.success(res.message);
        mutateExams();
        return;
      }
      toast.error(res.error);
    } else toast.error("You don't have permission.");
  };

  const onAddExamToggle = () => {
    if (hasPermission("add_exam")) {
      setShowForm(true);
    } else toast.error("You don't have permission.");
  };

  if (isLoading) return <div className="bg-background" />;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <Button onClick={onAddExamToggle} className="gap-2">
              <Plus className="h-4 w-4" />
              New Exam
            </Button>
            <Input
              placeholder="Search by name, code, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white text-sm"
            />
          </div>
        </div>

        {(showForm || showFormEdit) && (
          <ExamForm
            intakes={intakes}
            onClose={handleOnClose}
            exam={selectedExam}
            isUpdate={showFormEdit}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Exams ({exams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left font-semibold">Title</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Intake
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Semester
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Exam Date
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExams.length > 0 ? (
                    paginatedExams.map((exam) => (
                      <tr
                        key={exam.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 font-medium">{exam.title}</td>
                        <td className="py-3 px-4">{exam.intake}</td>
                        <td className="py-3 px-4">{exam.semester_name}</td>
                        <td className="py-3 px-4">{exam.date_started}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button
                              onClick={() => {
                                router.push(`/exam/exams/${exam.id}`);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/80"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setShowFormEdit(true);
                                setSelectedExam(exam);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/80"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <ConfirmationPopup
                              itemId={exam.id}
                              onAllow={onDeleteExam}
                              onCancel={() => {}}
                              onButtonText=""
                              onButtonVariant="ghost"
                              onAllowButtonText="Allow"
                              onCancelButtonText="Don't allow"
                              primaryText="Allow to delete?"
                              description="Do you want to allow this exam to be deleted permanently?"
                              buttonIcon={Trash2}
                              buttonClass={
                                "text-destructive hover:bg-destructive/80"
                              }
                              iconClass="h-4 w-4"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={currentRole === "Admissions" ? 5 : 4}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No exam found
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
    </main>
  );
}
