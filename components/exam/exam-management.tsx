"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EntityList } from "@/components/entity-list";
import { apiGet, apiDelete } from "@/lib/api-client";
import { usePermission } from "@/hooks/usePermission";
import type { EntityListConfig } from "@/types/forms";
import type { ExamSchedule, Intake } from "@/types";
import ExamForm from "./exam-form";

export function ExamManagement() {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const [showForm, setShowForm] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamSchedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamSchedule | null>(null);

  const { data: intakesResponse } = useSWR<{
    success: boolean;
    data: Intake[];
  }>("/exam/intakes-semester?page=1&limit=200", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: examsResponse, mutate } = useSWR<{
    success: boolean;
    data: ExamSchedule[];
  }>("/exam/exams?page=1&limit=200", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const intakes = intakesResponse?.data ?? [];
  const exams = examsResponse?.data ?? [];

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    if (!hasPermission("delete_exam")) {
      toast.error("You don't have permission.");
      return;
    }
    try {
      const res: { success: boolean; message: string; error: string } =
        await apiDelete(`/exam/exams/${deleteTarget.id}`);
      if (res.success) {
        toast.success(res.message);
        setDeleteTarget(null);
        mutate();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to delete exam");
    }
  }, [deleteTarget, mutate, hasPermission]);

  const handleAddExam = useCallback(() => {
    if (!hasPermission("add_exam")) {
      toast.error("You don't have permission.");
      return;
    }
    setShowForm(true);
  }, [hasPermission]);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setShowFormEdit(false);
    setSelectedExam(null);
    mutate();
  }, [mutate]);

  const handleEdit = useCallback((exam: ExamSchedule) => {
    setSelectedExam(exam);
    setShowFormEdit(true);
  }, []);

  const listConfig: EntityListConfig<ExamSchedule> = {
    columns: [
      { key: "title", header: "Title", sortable: true },
      { key: "intake", header: "Intake" },
      { key: "semester_name", header: "Semester" },
      {
        key: "date_started",
        header: "Exam Date",
        render: (e) => (
          <span>{new Date(e.date_started).toLocaleDateString()}</span>
        ),
      },
    ],
    searchFields: ["title", "intake", "semester_name"],
    itemsPerPage: 10,
    rowActions: (exam: ExamSchedule) => (
      <div className="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            router.push(`/exam/exams/${exam.id}`);
          }}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleEdit(exam);
          }}
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setDeleteTarget(exam);
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          All Exams ({exams.length})
        </h1>
        <Button onClick={handleAddExam} className="gap-2">
          Add Exam
        </Button>
      </div>

      {(showForm || showFormEdit) && (
        <div className="mb-6">
          <ExamForm
            intakes={intakes}
            onClose={handleFormClose}
            exam={selectedExam}
            isUpdate={showFormEdit}
          />
        </div>
      )}

      <EntityList
        config={listConfig}
        data={exams}
        isLoading={false}
        searchPlaceholder="Search by title, intake or semester..."
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
