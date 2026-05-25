"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Edit, Trash2, ChevronDown, Download, X, Plus } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { apiGet, apiDelete } from "@/lib/api-client";
import { filterIntakes, searchIntakes } from "@/lib/search-utils";
import type { EntityListConfig } from "@/types/forms";
import type { Intake, Major } from "@/types";
import { createIntakeFormConfig } from "@/form-configs/intake";
import type { IntakeFormValues } from "@/schemas/intake";
import { IntakeDetail } from "@/components/intake/intake-detail";

export function IntakeManagement() {
  const [showForm, setShowForm] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [editData, setEditData] = useState<IntakeFormValues | undefined>();
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [filters, setFilters] = useState({ major: "" });

  const { data: intakesRes, mutate } = useSWR<{ success: boolean; data: Intake[] }>(
    "/admission/intakes?page=1&limit=200",
    apiGet,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );
  const { data: majorsRes } = useSWR<{ success: boolean; data: Major[] }>(
    "/admission/majors?page=1&limit=200",
    apiGet,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const intakes = intakesRes?.data ?? [];
  const majors = majorsRes?.data ?? [];

  const filteredIntakes = (() => {
    let f = searchIntakes(intakes, searchQuery);
    f = filterIntakes(f, { major: filters.major || undefined });
    return f;
  })();

  const handleExportCSV = () => {
    const headers = ["No", "Intake Code", "Major", "Year", "Start Date", "Current Semester"];
    const rows = intakes.map((s, idx) => [
      idx + 1,
      s.code,
      s.majorName,
      s.year,
      s.startDate,
      s.currentStatus,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intakes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const activeFilters = Object.values(filters).filter((f) => f !== "").length;

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/admission/intakes/${deleteTarget}`);
      toast.success("Intake deleted successfully");
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error("Failed to delete intake");
    }
  }, [deleteTarget, mutate]);

  const handleRowClick = useCallback((intake: Intake) => {
    setSelectedIntakeId(intake.id);
    setDetailMode(true);
  }, []);

  const handleEdit = useCallback((intake: Intake) => {
    const v: IntakeFormValues = {
      code: intake.code,
      majorId: intake.majorId,
      year: intake.year,
      currentSemId: intake.currentSemId,
      capacity: intake.capacity,
      startDate: intake.startDate,
      endDate: intake.endDate ?? "",
      semester_schedules: intake.semester_schedules ?? [],
    };
    setEditData(v);
    setEditId(intake.id);
    setShowFormEdit(true);
  }, []);

  const formConfig = createIntakeFormConfig(majors);

  const listConfig: EntityListConfig<Intake> = {
    columns: [
      { key: "code", header: "Code", sortable: true },
      { key: "majorName", header: "Major", sortable: true },
      { key: "year", header: "Year", sortable: true },
      { key: "startDate", header: "Start Date", sortable: true },
      {
        key: "currentStatus",
        header: "Current Semester",
        render: (i) => {
          const sem = i.semester_schedules?.find(
            (s) => s.semester_id === i.currentSemId,
          );
          return sem?.semester_name ?? i.currentStatus;
        },
      },
    ],
    searchFields: ["code", "majorName", "year", "startDate", "currentStatus"],
    itemsPerPage: 6,
    onRowClick: handleRowClick,
    rowActions: (intake: Intake) => (
      <div className="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/80"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleEdit(intake);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/80"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setDeleteTarget(intake.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  };

  const selectedIntake = intakes.find((i) => i.id === selectedIntakeId);

  if (detailMode && selectedIntakeId) {
    return (
      <div className="space-y-4">
        <IntakeDetail
          intakeId={selectedIntakeId}
          selectedIntake={selectedIntake}
          majors={majors}
          years={
            majors.find((m) => m.id === selectedIntake?.majorId)?.years ?? []
          }
          onBack={() => {
            setDetailMode(false);
            setSelectedIntakeId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Intake
          </Button>
          <Input
            placeholder="Search by intake code, major name, year, status, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-background text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setExpandedFilters(!expandedFilters)}
            variant="outline"
            className="gap-2 bg-background flex-1"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedFilters ? "rotate-180" : ""}`}
            />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2 bg-background flex-1"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {expandedFilters && (
        <Card className="bg-muted/50 border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Major</label>
                <select
                  value={filters.major}
                  onChange={(e) => setFilters({ ...filters, major: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">All Majors</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {activeFilters > 0 && (
              <Button
                onClick={() => setFilters({ major: "" })}
                variant="ghost"
                size="sm"
                className="mt-4 gap-1 hover:bg-primary/80"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <EntityList
        config={listConfig}
        data={filteredIntakes}
        isLoading={false}
        searchPlaceholder="Search..."
      />

      <EntityFormDialog
        config={formConfig}
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={() => mutate()}
      />

      {editId && (
        <EntityFormDialog
          config={formConfig}
          open={showFormEdit}
          onOpenChange={(open) => {
            if (!open) {
              setShowFormEdit(false);
              setEditData(undefined);
              setEditId(undefined);
            }
          }}
          initialData={editData}
          isUpdate
          entityId={editId}
          onSuccess={() => {
            mutate();
            setShowFormEdit(false);
            setEditData(undefined);
            setEditId(undefined);
          }}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Allow to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to allow this intake to be deleted permanently?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Allow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
