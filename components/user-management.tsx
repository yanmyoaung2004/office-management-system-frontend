"use client";

import React from "react";

import { useState } from "react";
import type { User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { ConfirmationPopup } from "./confirmation-popup";
import { isValidEmailDomain } from "@/lib/dns-validator";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

interface UserManagementProps {
  users: User[];
  currentRole: UserRole;
  onAddUser: (user: Omit<User, "id">) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (newUser: User) => void;
}

export function UserManagement({
  users,
  currentRole,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
}: UserManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);

  const [formData, setFormData] = useState<User>({
    id: "",
    username: "",
    password: "",
    role: "staff" as "admin" | "staff",
    fullName: "",
    email: "",
  });

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await isValidEmailDomain(formData.email))) {
      toast.error("Email is not valid");
      return;
    }
    if (
      formData.username &&
      formData.password &&
      formData.fullName &&
      formData.email
    ) {
      if (showFormEdit) {
        onUpdateUser({
          id: formData.id,
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        });
        setShowFormEdit(false);
      } else {
        onAddUser({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        });
        setShowAddForm(false);
      }
      setFormData({
        id: "",
        username: "",
        password: "",
        fullName: "",
        email: "",
        role: "staff",
      });
    } else {
      toast.error("Please fill all the required fields");
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add User
      </Button>

      {(showAddForm || showFormEdit) && currentRole === "admin" && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <form
            onSubmit={handleAddUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-medium block mb-2">
                Username *
              </label>
              <Input
                value={formData.username}
                autoComplete="off"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Password *
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Full Name *
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Role *</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "staff",
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="pt-6 col-span-2 flex gap-2">
              <Button type="submit">
                {showFormEdit ? "Update User" : "Add User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setShowAddForm(false);
                  setShowFormEdit(false);
                  setFormData({
                    id: "",
                    username: "",
                    password: "",
                    fullName: "",
                    email: "",
                    role: "staff",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-semibold">
                    Username
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Full Name
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Email</th>
                  <th className="py-3 px-4 text-left font-semibold">Role</th>
                  {currentRole === "admin" && (
                    <th className="py-3 px-4 text-left font-semibold">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium">{user.username}</td>
                      <td className="py-3 px-4">{user.fullName}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-accent/10 text-accent"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {user.role === "admin" ? "Administrator" : "Staff"}
                        </span>
                      </td>
                      {currentRole === "admin" && (
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => {
                              setShowFormEdit(true);
                              setFormData(user);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!user.is_superuser && (
                            <ConfirmationPopup
                              itemId={user.id as string}
                              onAllow={() => onDeleteUser(user.id as string)}
                              onCancel={() => {}}
                              onButtonText=""
                              onButtonVariant="ghost"
                              onAllowButtonText="Allow"
                              onCancelButtonText="Don't allow"
                              primaryText="Allow to delete?"
                              description="Do you want to allow this intake to be deleted permanently?"
                              buttonIcon={Trash2}
                              buttonClass={
                                "text-destructive hover:bg-destructive/80"
                              }
                              iconClass="h-4 w-4"
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={currentRole === "admin" ? 5 : 4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No users found
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
