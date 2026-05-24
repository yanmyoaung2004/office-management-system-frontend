"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Edit, Plus, Trash2, Eye, Loader2, Search } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SubjectHierarchySelector } from "./subject-hierarchy-selector";

interface SubjectDisplay {
  id: string;
  code: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  subject_ids: string[];
  subjects_display: SubjectDisplay[];
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

export function TeacherManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    subject_ids: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const { data: response, mutate } = useSWR<{
    success: boolean;
    data: Teacher[];
  }>("/exam/teachers/", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const teachers = useMemo(() => response?.data ?? [], [response?.data]);

  const filtered = useMemo(() => {
    if (!searchQuery) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.phone_number.includes(q) ||
        t.email?.toLowerCase().includes(q),
    );
  }, [teachers, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const openAddForm = () => {
    setEditingTeacher(null);
    setFormData({ name: "", phone_number: "", email: "", subject_ids: [] });
    setShowForm(true);
  };

  const openEditForm = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      phone_number: teacher.phone_number,
      email: teacher.email ?? "",
      subject_ids: [...(teacher.subject_ids ?? [])],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error("Phone number is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim() || undefined,
        subject_ids: formData.subject_ids,
      };

      if (editingTeacher) {
        await apiPut(`/exam/teachers/${editingTeacher.id}/`, payload);
        toast.success("Teacher updated");
      } else {
        await apiPost("/exam/teachers/", payload);
        toast.success("Teacher created");
      }
      setShowForm(false);
      mutate();
    } catch {
      toast.error("Failed to save teacher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/exam/teachers/${deleteTarget.id}/`);
      toast.success("Teacher deleted");
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error("Failed to delete teacher");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={openAddForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone or email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-8 bg-white"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <span>All Teachers ({teachers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">No</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Subjects
                  </th>
                  <th className="text-right py-3 px-4 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  paginated.map((teacher, idx) => (
                    <tr
                      key={teacher.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium">{teacher.name}</td>
                      <td className="py-3 px-4">{teacher.phone_number}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {teacher.email || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects_display.length === 0 ? (
                            <span className="text-muted-foreground text-xs">
                              None
                            </span>
                          ) : (
                            teacher.subjects_display.map((s) => (
                              <Badge
                                key={s.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {s.code}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/exam/teachers/${teacher.id}`)
                            }
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(teacher)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(teacher)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="min-w-xl sm:min-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Edit Teacher" : "Add Teacher"}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher
                  ? "Update the teacher's information and subjects."
                  : "Fill in the details to create a new teacher."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  placeholder="e.g. +260991234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="e.g. john@sti.edu"
                />
              </div>
              <div className="space-y-2">
                <Label>Subjects</Label>
                <SubjectHierarchySelector
                  selectedIds={formData.subject_ids}
                  onChange={(ids) =>
                    setFormData((prev) => ({ ...prev, subject_ids: ids }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  {editingTeacher ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteTarget?.name}
                &quot;? This action cannot be undone.
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
      </Card>
    </div>
  );
}
