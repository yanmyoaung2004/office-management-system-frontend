"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Eye, Edit, Trash2, X, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EntityList } from "@/components/entity-list";
import { SubjectHierarchySelector } from "./subject-hierarchy-selector";
import { apiGet, apiDelete, apiPost, apiPut } from "@/lib/api-client";
import { teacherSchema, teacherDefaultValues, type TeacherFormValues } from "@/schemas/teacher";
import type { EntityListConfig } from "@/types/forms";

interface SubjectDisplay {
  id: string;
  code: string;
  name: string;
}

interface Teacher {
  id: string;
  type: "FULL_TIME" | "PART_TIME";
  name: string;
  phone_number: string;
  email: string;
  subject_ids: string[];
  subjects_display: SubjectDisplay[];
  created_at: string;
  updated_at: string;
}

export function TeacherManagement() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: response, mutate, isLoading } = useSWR<{
    success: boolean;
    data: Teacher[];
  }>("/exam/teachers/", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const teachers = response?.data ?? [];

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema) as any,
    defaultValues: teacherDefaultValues,
  });

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/exam/teachers/${deleteTarget.id}/`);
      toast.success("Teacher deleted");
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error("Failed to delete teacher");
    }
  }, [deleteTarget, mutate]);

  const openCreate = useCallback(() => {
    setEditingTeacher(null);
    form.reset(teacherDefaultValues);
    setShowForm(true);
  }, [form]);

  const openEdit = useCallback((teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.reset({
      name: teacher.name,
      phone_number: teacher.phone_number,
      email: teacher.email ?? "",
      type: teacher.type,
      subject_ids: teacher.subject_ids ?? [],
    });
    setShowForm(true);
  }, [form]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingTeacher(null);
    form.reset(teacherDefaultValues);
  }, [form]);

  const handleSubmit = useCallback(async (data: TeacherFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingTeacher) {
        await apiPut(`/exam/teachers/${editingTeacher.id}/`, data);
        toast.success("Teacher updated successfully");
      } else {
        const res: any = await apiPost("/exam/teachers/", data);
        if (res?.data?.id) {
          router.push(`/exam/teachers/${res.data.id}`);
        }
        toast.success("Teacher created successfully");
      }
      mutate();
      closeForm();
    } catch {
      toast.error(editingTeacher ? "Failed to update teacher" : "Failed to create teacher");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTeacher, router, mutate, closeForm]);

  const subjectIds = form.watch("subject_ids");

  const listConfig: EntityListConfig<Teacher> = {
    columns: [
      {
        key: "type",
        header: "Type",
        render: (t) => (
          <Badge variant={t.type === "FULL_TIME" ? "default" : "secondary"} className="text-xs">
            {t.type === "FULL_TIME" ? "Full-Time" : "Part-Time"}
          </Badge>
        ),
      },
      { key: "name", header: "Name", sortable: true },
      { key: "phone_number", header: "Phone" },
      {
        key: "email",
        header: "Email",
        render: (t) => (
          <span className="text-muted-foreground">{t.email || "-"}</span>
        ),
      },
      {
        key: "subjects_display",
        header: "Subjects",
        render: (t) =>
          t.subjects_display.length === 0 ? (
            <span className="text-muted-foreground text-xs">None</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {t.subjects_display.map((s) => (
                <Badge key={s.id} variant="outline" className="text-xs">
                  {s.code}
                </Badge>
              ))}
            </div>
          ),
      },
    ],
    searchFields: ["name", "phone_number", "email"],
    itemsPerPage: 10,
    rowActions: (teacher: Teacher) => (
      <div className="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            router.push(`/exam/teachers/${teacher.id}`);
          }}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openEdit(teacher);
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
            setDeleteTarget(teacher);
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
          All Teachers ({teachers.length})
        </h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingTeacher ? "Edit Teacher" : "New Teacher"}
            </h2>
            <Button variant="ghost" size="sm" onClick={closeForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Type <span className="text-destructive">*</span>
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...form.register("type")}
                >
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. John Doe"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Phone <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. +260991234567"
                  {...form.register("phone_number")}
                />
                {form.formState.errors.phone_number && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.phone_number.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="e.g. john@sti.edu"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Subject Assignment
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Select the subjects this teacher can teach
              </p>
              <SubjectHierarchySelector
                selectedIds={subjectIds ?? []}
                onChange={(ids) => form.setValue("subject_ids", ids)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                {isSubmitting
                  ? "Saving..."
                  : editingTeacher
                    ? "Update Teacher"
                    : "Create Teacher"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <EntityList
        config={listConfig}
        data={teachers}
        isLoading={isLoading}
        searchPlaceholder="Search by name, phone or email..."
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
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
    </>
  );
}
