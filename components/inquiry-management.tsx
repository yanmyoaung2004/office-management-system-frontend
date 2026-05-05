"use client";

import React from "react";

import { useState } from "react";
import type {
  Enquiry,
  FollowUpSession,
  EnquiryType,
  SourceOfInformation,
  UserRole,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  MessageSquare,
  Edit,
} from "lucide-react";
import { Pagination } from "@/components/pagination";
import { ConfirmationPopup } from "./confirmation-popup";
import { Textarea } from "./ui/textarea";

const ITEMS_PER_PAGE = 8;

interface InquiryManagementProps {
  enquiries: Enquiry[];
  currentRole: UserRole;
  onAddEnquiry: (enquiry: Omit<Enquiry, "id">) => void;
  onDeleteEnquiry: (enquiryId: string) => void;
  onDeleteFollowUp: (id: string) => void;
  onUpdateFollowUp: (followupId: string, followUp: FollowUpSession) => void;
  onAddFollowUp: (
    enquiryId: string,
    followUp: Omit<FollowUpSession, "id" | "enquiryId">,
  ) => void;
}

export function InquiryManagement({
  enquiries,
  currentRole,
  onAddEnquiry,
  onDeleteEnquiry,
  onDeleteFollowUp,
  onAddFollowUp,
  onUpdateFollowUp,
}: InquiryManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEnquiry, setExpandedEnquiry] = useState<string | null>(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState<boolean>(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState<string | null>(null);
  const [showFollowUpFormEdit, setShowFollowUpFormEdit] =
    useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [enquiryForm, setEnquiryForm] = useState({
    studentName: "",
    studentContactNo: "",
    parentName: "",
    parentContactNo: "",
    address: "",
    desiredProgram: "",
    remark: "",
    educationLevel: "",
    enquiryType: "Enquiry" as EnquiryType,
    sourceOfInformation: "Friend" as SourceOfInformation,
    date: new Date().toISOString().split("T")[0],
  });

  const [followUpForm, setFollowUpForm] = useState({
    id: "",
    date: new Date().toISOString().split("T")[0],
    handledBy: "",
    walkupFollowup: false,
    remark: "",
  });

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

  const handleAddEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (enquiryForm.studentName && enquiryForm.desiredProgram) {
      onAddEnquiry({
        date: enquiryForm.date,
        desiredProgram: enquiryForm.desiredProgram,
        studentName: enquiryForm.studentName,
        educationLevel: enquiryForm.educationLevel,
        studentContactNo: enquiryForm.studentContactNo,
        parentName: enquiryForm.parentName,
        parentContactNo: enquiryForm.parentContactNo,
        address: enquiryForm.address,
        remark: enquiryForm.remark,
        enquiryType: enquiryForm.enquiryType,
        sourceOfInformation: enquiryForm.sourceOfInformation,
        followUpSessions: [],
      });
      setEnquiryForm({
        studentName: "",
        remark: "",
        studentContactNo: "",
        parentName: "",
        parentContactNo: "",
        address: "",
        desiredProgram: "",
        educationLevel: "",
        enquiryType: "Enquiry",
        sourceOfInformation: "Friend",
        date: new Date().toISOString().split("T")[0],
      });
      setShowEnquiryForm(false);
    }
  };

  const handleAddUpdateFollowUp = (e: React.FormEvent, enquiryId: string) => {
    e.preventDefault();
    if (followUpForm.handledBy) {
      if (showFollowUpFormEdit) {
        onUpdateFollowUp(followUpForm.id, {
          id: followUpForm.id,
          enquiryId: enquiryId,
          date: followUpForm.date,
          handledBy: followUpForm.handledBy,
          walkupFollowup: followUpForm.walkupFollowup,
          remark: followUpForm.remark,
        });
      } else {
        onAddFollowUp(enquiryId, {
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
    }
  };

  const canManage = currentRole === "Admissions" || currentRole === "staff";

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          onClick={() => setShowEnquiryForm(!showEnquiryForm)}
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
              className="flex-1 bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {showEnquiryForm && canManage && (
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-xl font-semibold mb-4">New Inquiry</h2>
          <form onSubmit={handleAddEnquiry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Inquiry Date *
                </label>
                <Input
                  type="date"
                  value={enquiryForm.date}
                  onChange={(e) =>
                    setEnquiryForm({ ...enquiryForm, date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Inquiry Type *
                </label>
                <select
                  value={enquiryForm.enquiryType}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      enquiryType: e.target.value as EnquiryType,
                    })
                  }
                  className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="Enquiry">Enquiry</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Phone">Phone</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Student Name *
                </label>
                <Input
                  placeholder="Student Name"
                  value={enquiryForm.studentName}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      studentName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Student Phone No.
                </label>
                <Input
                  required
                  placeholder="Student Phone Number"
                  value={enquiryForm.studentContactNo}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      studentContactNo: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Desired Program *
                </label>
                <Input
                  value={enquiryForm.desiredProgram}
                  placeholder="Desired Program"
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      desiredProgram: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Education Level
                </label>
                <Input
                  placeholder="Education Level"
                  value={enquiryForm.educationLevel}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      educationLevel: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Parent/Guardian Name
                </label>
                <Input
                  required
                  placeholder="Parent Name"
                  value={enquiryForm.parentName}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      parentName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Parent Phone No.
                </label>
                <Input
                  required
                  placeholder="Parent Phone Number"
                  value={enquiryForm.parentContactNo}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      parentContactNo: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Address
                </label>
                <Input
                  required
                  placeholder="Address"
                  value={enquiryForm.address}
                  onChange={(e) =>
                    setEnquiryForm({ ...enquiryForm, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  How did you hear about us? *
                </label>
                <select
                  value={enquiryForm.sourceOfInformation}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      sourceOfInformation: e.target
                        .value as SourceOfInformation,
                    })
                  }
                  className="w-full text-sm px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="Friend">Friend</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Pamphlet">Pamphlet</option>
                  <option value="Newspaper">Newspaper</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium block mb-2">Remark</label>
                <Textarea
                  placeholder="Remark"
                  value={enquiryForm.remark}
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      remark: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Save Inquiry
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEnquiryForm(false);
                  setEnquiryForm({
                    studentName: "",
                    studentContactNo: "",
                    parentName: "",
                    parentContactNo: "",
                    address: "",
                    desiredProgram: "",
                    remark: "",
                    educationLevel: "",
                    enquiryType: "Enquiry" as EnquiryType,
                    sourceOfInformation: "Friend" as SourceOfInformation,
                    date: new Date().toISOString().split("T")[0],
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

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
                                className="flex-1 hover:bg-primary"
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
                                <div className="flex gap-3 ">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    type="submit"
                                    onClick={() => {
                                      setFollowUpForm({
                                        id: session.id,
                                        date: session.date,
                                        handledBy: session.handledBy,
                                        walkupFollowup: session.walkupFollowup,
                                        remark: session.remark,
                                      });
                                      setShowFollowUpFormEdit(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <ConfirmationPopup
                                    itemId={session.id}
                                    onButtonVariant="outline"
                                    onAllow={onDeleteFollowUp}
                                    onCancel={() => {}}
                                    onButtonText="Delete"
                                    onAllowButtonText="Allow"
                                    onCancelButtonText="Don't allow"
                                    primaryText="Allow to delete?"
                                    description="Do you want to allow this follow-up session to be deleted permanently?"
                                    buttonIcon={Trash2}
                                    buttonClass={
                                      "text-destructive hover:bg-destructive/80 gap-1"
                                    }
                                    iconClass="h-4 w-4"
                                  />
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
                        <ConfirmationPopup
                          iconClass="h-4 w-4"
                          itemId={enquiry.id}
                          onAllow={onDeleteEnquiry}
                          onCancel={() => {}}
                          onButtonText="Delete Inquiry"
                          onButtonVariant="outline"
                          onAllowButtonText="Allow"
                          onCancelButtonText="Don't allow"
                          primaryText="Allow to delete?"
                          description="Do you want to allow this inquiry to be deleted permanently?"
                          buttonIcon={Trash2}
                          buttonClass={
                            "text-destructive hover:bg-destructive/80 gap-1 w-full"
                          }
                        />
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
    </div>
  );
}
