"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from "react";
import useSWR, { type SWRConfiguration } from "swr";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EntityList } from "@/components/entity-list";
import { EntityFormDialog } from "@/components/entity-form";
import { apiDelete, swrFetcher } from "@/lib/api-client";
import { toast } from "sonner";
import type { EntityListConfig, EntityPageConfig, FieldValues } from "@/types/forms";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EntityPageProps<TForm extends FieldValues, TEntity> {
  config: EntityPageConfig<TForm>;
  swrOptions?: SWRConfiguration;
  transformData?: (response: any) => TEntity[];
  onEntityCreated?: () => void;
  entityActions?: (item: TEntity) => React.ReactNode;
}

export function EntityPage<TForm extends FieldValues, TEntity extends Record<string, any>>({
  config,
  swrOptions,
  transformData,
  onEntityCreated,
  entityActions,
}: EntityPageProps<TForm, TEntity>) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<{ data: Partial<TForm>; id: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: response, mutate, isLoading } = useSWR(
    config.swrKey,
    swrFetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000, ...swrOptions },
  );

  const items: TEntity[] = transformData
    ? transformData(response)
    : (response as any)?.data ?? [];

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(config.deleteEndpoint!(deleteTarget.id));
      toast.success(`${config.formConfig.entityName} deleted`);
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error(`Failed to delete ${config.formConfig.entityName.toLowerCase()}`);
    }
  }, [deleteTarget, config, mutate]);

  const openCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const openEdit = (item: TEntity) => {
    setEditingItem({ data: item as unknown as Partial<TForm>, id: (item as any).id });
    setShowForm(true);
  };

  const handleSuccess = () => {
    mutate();
    onEntityCreated?.();
  };

  const listConfig: EntityListConfig<TEntity> = {
    ...config.listConfig,
    rowActions: entityActions
      ? entityActions
      : (item: TEntity) => (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(item);
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget({ id: (item as any).id, label: (item as any).name ?? (item as any).fullName ?? (item as any).title ?? "" });
              }}
            >
              Delete
            </Button>
          </div>
        ),
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {config.title}
          </h1>
          {config.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          )}
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New {config.formConfig.entityName}
        </Button>
      </div>

      <EntityList
        config={listConfig}
        data={items as any}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${config.formConfig.entityNamePlural?.toLowerCase() ?? (config.formConfig.entityName + "s").toLowerCase()}...`}
      />

      <EntityFormDialog
        config={config.formConfig}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingItem(null);
        }}
        initialData={editingItem?.data}
        isUpdate={!!editingItem}
        entityId={editingItem?.id}
        onSuccess={handleSuccess}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {config.formConfig.entityName}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.label}&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
