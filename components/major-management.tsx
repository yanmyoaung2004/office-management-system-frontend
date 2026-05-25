"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from "react";
import useSWR from "swr";
import { BookOpen, Download, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

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
import { EntityFormDialog } from "@/components/entity-form";
import { YearSemesterBuilder } from "@/components/major/year-semester-builder";
import { SubjectManagement } from "@/components/subject-management";
import { majorFormConfig } from "@/form-configs/major";
import { apiGet, apiDelete } from "@/lib/api-client";
import { handleExportCSV } from "@/lib/utils";
import type { EntityListConfig } from "@/types/forms";
import type { MajorFormValues } from "@/schemas/major";
import type { Major } from "@/types";

export function MajorManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Major | null>(null);
  const [subjectManagementMajor, setSubjectManagementMajor] =
    useState<Major | null>(null);

  const { data: response, mutate, isLoading } = useSWR<{
    success: boolean;
    data: Major[];
  }>("/admission/majors?page=1&limit=200", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const majors = response?.data ?? [];

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/admission/majors/${deleteTarget.id}`);
      toast.success("Major deleted");
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error("Failed to delete major");
    }
  }, [deleteTarget, mutate]);

  const openCreate = useCallback(() => {
    setEditingMajor(null);
    setShowForm(true);
  }, []);

  const openEdit = useCallback((major: Major) => {
    setEditingMajor(major);
    setShowForm(true);
  }, []);

  const formConfig = {
    ...majorFormConfig,
    sections: majorFormConfig.sections.map((s) => ({
      ...s,
      fields: s.fields.map((f) => {
        if (f.name === "years") {
          return {
            ...f,
            render: (form: ReturnType<typeof useForm<MajorFormValues>>) => (
              <YearSemesterBuilder
                value={form.watch("years") ?? []}
                onChange={(years) => form.setValue("years", years)}
              />
            ),
          };
        }
        return f;
      }),
    })),
  };

  const handleMajorsCSVExport = () => {
    const headers = [
      "No",
      "Major Name",
      "Code",
      "Description",
      "Year Status",
      "Semester Status",
    ];
    const rows: (string | number)[][] = [];
    let globalCounter = 1;

    majors.forEach((major) => {
      if (!major.years || major.years.length === 0) {
        rows.push([
          globalCounter++,
          major.name,
          major.code,
          major.description,
          "No years added yet",
          "Pending",
        ]);
        return;
      }

      let isFirstRowForMajor = true;

      major.years.forEach((year) => {
        if (!year.semesters || year.semesters.length === 0) {
          rows.push([
            isFirstRowForMajor ? globalCounter++ : "",
            isFirstRowForMajor ? major.name : "",
            isFirstRowForMajor ? major.code : "",
            isFirstRowForMajor ? major.description : "",
            year.name,
            "No semesters defined",
          ]);
          isFirstRowForMajor = false;
          return;
        }

        year.semesters.forEach((semester) => {
          rows.push([
            isFirstRowForMajor ? globalCounter++ : "",
            isFirstRowForMajor ? major.name : "",
            isFirstRowForMajor ? major.code : "",
            isFirstRowForMajor ? major.description : "",
            year.name,
            semester.name,
          ]);
          isFirstRowForMajor = false;
        });
      });
    });

    const fileName = `majors-${new Date().toISOString().split("T")[0]}.csv`;
    handleExportCSV(headers, rows, fileName);
  };

  const listConfig: EntityListConfig<Major> = {
    columns: [
      { key: "name", header: "Name", sortable: true },
      { key: "code", header: "Code" },
      {
        key: "description",
        header: "Description",
        render: (m) => (
          <span className="text-muted-foreground text-sm line-clamp-1">
            {m.description}
          </span>
        ),
      },
    ],
    searchFields: ["name", "code", "description"],
    itemsPerPage: 10,
    rowActions: (major: Major) => (
      <div className="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setSubjectManagementMajor(major);
          }}
          title="Manage subjects"
        >
          <BookOpen className="h-4 w-4 text-amber-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openEdit(major);
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
            setDeleteTarget(major);
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
          All Majors ({majors.length})
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={handleMajorsCSVExport}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={openCreate} className="gap-2">
            Add Major
          </Button>
        </div>
      </div>

      <EntityList
        config={listConfig}
        data={majors}
        isLoading={isLoading}
        searchPlaceholder="Search by name, code or description..."
      />

      <EntityFormDialog
        config={formConfig as any}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingMajor(null);
        }}
        initialData={
          editingMajor
            ? {
                name: editingMajor.name,
                code: editingMajor.code,
                description: editingMajor.description,
                years: editingMajor.years ?? [],
              }
            : undefined
        }
        isUpdate={!!editingMajor}
        entityId={editingMajor?.id}
        onSuccess={() => mutate()}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Major</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}
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

      {subjectManagementMajor && (
        <SubjectManagement
          major={subjectManagementMajor}
          open={!!subjectManagementMajor}
          onOpenChange={(v) => {
            if (!v) setSubjectManagementMajor(null);
          }}
        />
      )}
    </>
  );
}
