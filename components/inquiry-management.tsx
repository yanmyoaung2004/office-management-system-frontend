"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import type { Enquiry, FollowUpSession, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  MessageSquare,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";
import { EntityFormDialog } from "@/components/entity-form";
import { enquiryFormConfig } from "@/form-configs/enquiry";
import { apiGet, apiDelete, apiPost, apiPut } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 8;

export function InquiryManagement() {
  const { user } = useAuth();
  const currentRole = user?.role as UserRole;

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEnquiry, setExpandedEnquiry] = useState<string | null>(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState<string | null>(null);
  const [showFollowUpFormEdit, setShowFollowUpFormEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteEnquiryTarget, setDeleteEnquiryTarget] = useState<Enquiry | null>(null);
  const [deleteFollowUpTarget, setDeleteFollowUpTarget] = useState<FollowUpSession | null>(null);

  const [followUpForm, setFollowUpForm] = useState({
    id: "",
    date: new Date().toISOString().split("T")[0],
    handledBy: "",
    walkupFollowup: false,
    remark: "",
  });

  const { data: response, mutate } = useSWR<{
    success: boolean;
    data: Enquiry[];
  }>("/admission/enquiries?page=1&limit=200", apiGet, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const enquiries = response?.data ?? [];

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      enquiry.studentName.toLowerCase().includes(lowerQuery) ||
      enquiry.desiredProgram.toLowerCase().includes(lowerQuery) ||
      enquiry.studentContactNo.toLowerCase().includes(lowerQuery) ||
      enquiry.parentName.toLowerCase().includes(lowerQuery)
    );
  });

  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE);
  const paginatedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDeleteEnquiry = useCallback(async () => {
    if (!deleteEnquiryTarget) return;
    try {
      await apiDelete(`/admission/enquiries/${deleteEnquiryTarget.id}`);
      toast.success("Enquiry deleted");
      setDeleteEnquiryTarget(null);
      mutate();
    } catch {
      toast.error("Failed to delete enquiry");
    }
  }, [deleteEnquiryTarget, mutate]);

  const handleDeleteFollowUp = useCallback(async () => {
    if (!deleteFollowUpTarget) return;
    try {
      await apiDelete(`/admission/followups/${deleteFollowUpTarget.id}`);
      toast.success("Follow-up session deleted");
      setDeleteFollowUpTarget(null);
      mutate();
    } catch {
      toast.error("Failed to delete follow-up session");
    }
  }, [deleteFollowUpTarget, mutate]);

  const handleAddUpdateFollowUp = async (e: React.FormEvent, enquiryId: string) => {
    e.preventDefault();
    if (!followUpForm.handledBy) {
      toast.error("Handled by is required");
      return;
    }
    try {
      if (showFollowUpFormEdit) {
        await apiPut(`/admission/followups/${followUpForm.id}`, {
          id: followUpForm.id,
          enquiryId,
          date: followUpForm.date,
          handledBy: followUpForm.handledBy,
          walkupFollowup: followUpForm.walkupFollowup,
          remark: followUpForm.remark,
        });
      } else {
        await apiPost(`/admission/enquiries/${enquiryId}/followups`, {
          date: followUpForm.date,
          handledBy: followUpForm.handledBy,
          walkupFollowup: followUpForm.walkupFollowup,
          remark: followUpForm.remark,
        });
      }
      setFollowUpForm({
        id: "",
        date: new Date().toISOString().split("T")[0],
        handledBy: "",
        walkupFollowup: false,
        remark: "",
      });
      setShowFollowUpForm(null);
      setShowFollowUpFormEdit(false);
      mutate();
      toast.success(
        showFollowUpFormEdit
          ? "Follow-up session updated"
          : "Follow-up session added",
      );
    } catch {
      toast.error("Failed to save follow-up session");
    }
  };

  const canManage = currentRole === "Admissions" || currentRole === "staff";

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          onClick={() => setShowEnquiryForm(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Inquiry
        </Button>

        <div className="space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search by name, program, phone, or parent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-background text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {paginatedEnquiries.length > 0 ? (
          paginatedEnquiries.map((enquiry) => (
            <Card
              key={enquiry.id}
              className="overflow-hidden border border-border"
            >
              <div className="bg-card p-4">
                <button
                  onClick={() =>
                    setExpandedEnquiry(
                      expandedEnquiry === enquiry.id ? null : enquiry.id,
                    )
                  }
                  className="w-full flex justify-between items-start hover:opacity-75 transition-opacity"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {enquiry.studentName}
                      </h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {enquiry.enquiryType}
                      </span>
                      <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
                        {enquiry.sourceOfInformation}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Program: {enquiry.desiredProgram} | Date:{" "}
                      {new Date(enquiry.date).toLocaleDateString()}
                    </p>
                  </div>
                  {expandedEnquiry === enquiry.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {expandedEnquiry === enquiry.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Student Contact
                        </p>
                        <p className="text-foreground">
                          {enquiry.studentContactNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Education Level
                        </p>
                        <p className="text-foreground">
                          {enquiry.educationLevel}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Parent/Guardian
                        </p>
                        <p className="text-foreground">{enquiry.parentName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Parent Contact
                        </p>
                        <p className="text-foreground">
                          {enquiry.parentContactNo}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground font-medium">
                          Address
                        </p>
                        <p className="text-foreground">{enquiry.address}</p>
                      </div>
                    </div>

                    {enquiry.remark && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium text-muted-foreground">
                          Remark
                        </p>
                        <p className="text-sm text-foreground">
                          {enquiry.remark}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Follow-up Sessions ({enquiry.followUpSessions?.length}
                          )
                        </h4>
                        {canManage && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowFollowUpForm(
                                showFollowUpForm === enquiry.id
                                  ? null
                                  : enquiry.id,
                              )
                            }
                            className="gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </Button>
                        )}
                      </div>

                      {(showFollowUpFormEdit ||
                        showFollowUpForm === enquiry.id) &&
                        canManage && (
                          <form
                            onSubmit={(e) =>
                              handleAddUpdateFollowUp(e, enquiry.id)
                            }
                            className="bg-muted p-3 rounded-md space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium block mb-1">
                                  Follow-up Date *
                                </label>
                                <Input
                                  type="date"
                                  value={followUpForm.date}
                                  onChange={(e) =>
                                    setFollowUpForm({
                                      ...followUpForm,
                                      date: e.target.value,
                                    })
                                  }
                                  required
                                  className="h-8 text-sm"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium block mb-1">
                                  Handled By *
                                </label>
                                <Input
                                  value={followUpForm.handledBy}
                                  onChange={(e) =>
                                    setFollowUpForm({
                                      ...followUpForm,
                                      handledBy: e.target.value,
                                    })
                                  }
                                  placeholder="Staff name"
                                  required
                                  className="h-8 text-sm"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={followUpForm.walkupFollowup}
                                    onChange={(e) =>
                                      setFollowUpForm({
                                        ...followUpForm,
                                        walkupFollowup: e.target.checked,
                                      })
                                    }
                                    className="rounded"
                                  />
                                  Walk-up Follow-up
                                </label>
                              </div>

                              <div className="col-span-2">
                                <label className="text-xs font-medium block mb-1">
                                  Remark
                                </label>
                                <textarea
                                  value={followUpForm.remark}
                                  onChange={(e) =>
                                    setFollowUpForm({
                                      ...followUpForm,
                                      remark: e.target.value,
                                    })
                                  }
                                  placeholder="Follow-up notes..."
                                  className="w-full px-2 py-1 border border-border rounded text-xs bg-card text-foreground resize-none"
                                  rows={2}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                size="sm"
                                className="flex-1"
                              >
                                {showFollowUpFormEdit
                                  ? "Update Follow-up"
                                  : "Save Follow-up"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowFollowUpForm(null);
                                  setShowFollowUpFormEdit(false);
                                  setFollowUpForm({
                                    id: "",
                                    date: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                    handledBy: "",
                                    walkupFollowup: false,
                                    remark: "",
                                  });
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        )}

                      {enquiry.followUpSessions?.length > 0 ? (
                        <div className="space-y-2">
                          {enquiry.followUpSessions
                            .filter((session) => session.id !== followUpForm.id)
                            .map((session) => (
                              <div
                                key={session.id}
                                className="bg-card border border-border rounded-md p-3 text-sm space-y-1"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {new Date(
                                        session.date,
                                      ).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Handled by: {session.handledBy}
                                    </p>
                                  </div>
                                  {session.walkupFollowup && (
                                    <div>
                                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">
                                        Walk-up
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-foreground py-0.5">
                                  {session.remark}
                                </p>
                                <div className="flex gap-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                      setFollowUpForm({
                                        id: session.id,
                                        date: session.date,
                                        handledBy: session.handledBy,
                                        walkupFollowup: session.walkupFollowup,
                                        remark: session.remark,
                                      });
                                      setShowFollowUpFormEdit(true);
                                      setShowFollowUpForm(session.enquiryId);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive gap-1"
                                    type="button"
                                    onClick={() =>
                                      setDeleteFollowUpTarget(session)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No follow-up sessions yet
                        </p>
                      )}
                    </div>

                    {canManage && (
                      <div className="pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          className="text-destructive hover:text-destructive gap-1 w-full"
                          type="button"
                          onClick={() => setDeleteEnquiryTarget(enquiry)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Inquiry
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center bg-card border border-border">
            <p className="text-muted-foreground">No inquiries found</p>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <EntityFormDialog
        config={enquiryFormConfig}
        open={showEnquiryForm}
        onOpenChange={(open) => {
          setShowEnquiryForm(open);
        }}
        onSuccess={() => mutate()}
      />

      <AlertDialog
        open={!!deleteEnquiryTarget}
        onOpenChange={(open) => !open && setDeleteEnquiryTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the enquiry for &ldquo;
              {deleteEnquiryTarget?.studentName}&rdquo;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEnquiry}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteFollowUpTarget}
        onOpenChange={(open) => !open && setDeleteFollowUpTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Follow-up Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this follow-up session? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFollowUp}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
