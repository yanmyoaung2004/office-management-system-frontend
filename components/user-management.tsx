"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { userFormConfig } from "@/form-configs/user";
import { apiGet, apiDelete } from "@/lib/api-client";
import type { EntityListConfig } from "@/types/forms";
import type { User } from "@/types";

export function UserManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data: response, mutate, isLoading } = useSWR<{
    success: boolean;
    data: User[];
  }>("/users?page=1&limit=200", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const users = response?.data ?? [];

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/users/${deleteTarget.id}`);
      toast.success("User deleted");
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error("Failed to delete user");
    }
  }, [deleteTarget, mutate]);

  const openCreate = useCallback(() => {
    setEditingUser(null);
    setShowForm(true);
  }, []);

  const openEdit = useCallback((user: User) => {
    setEditingUser(user);
    setShowForm(true);
  }, []);

  const listConfig: EntityListConfig<User> = {
    columns: [
      { key: "username", header: "Username", sortable: true },
      { key: "fullName", header: "Full Name", sortable: true },
      { key: "email", header: "Email" },
      {
        key: "role",
        header: "Role",
        render: (u) => (
          <Badge
            variant={u.role === "Admin" ? "default" : "secondary"}
            className="text-xs"
          >
            {u.role === "Admin" ? "Administrator" : "Staff"}
          </Badge>
        ),
      },
    ],
    searchFields: ["username", "fullName", "email"],
    itemsPerPage: 10,
    rowActions: (user: User) => (
      <div className="flex gap-1 justify-end">
        {!user.isSuperuser && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                openEdit(user);
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
                setDeleteTarget(user);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    ),
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          All Users ({users.length})
        </h1>
        <Button onClick={openCreate} className="gap-2">
          Add User
        </Button>
      </div>

      <EntityList
        config={listConfig}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search by username, name or email..."
      />

      <EntityFormDialog
        config={userFormConfig}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingUser(null);
        }}
        initialData={
          editingUser
            ? {
                username: editingUser.username,
                password: "",
                fullName: editingUser.fullName,
                email: editingUser.email,
                role: editingUser.role as "Admin" | "staff",
              }
            : undefined
        }
        isUpdate={!!editingUser}
        entityId={editingUser?.id}
        onSuccess={() => mutate()}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.username}
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
