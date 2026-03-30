"use client";

import React from "react";

import { useState } from "react";
import type { DailyReport, User, Enquiry, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Pagination } from "@/components/pagination";

interface ReportManagementProps {
  reports: DailyReport[];
  users: User[];
  enquiries: Enquiry[];
  currentRole: UserRole;
  currentUserId?: string;
  onAddReport: (report: Omit<DailyReport, "id" | "createdAt">) => void;
  onDeleteReport: (reportId: string) => void;
}

const ITEMS_PER_PAGE = 5;

export function ReportManagement({
  reports,
  users,
  enquiries,
  currentRole,
  currentUserId,
  onAddReport,
  onDeleteReport,
}: ReportManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(
    new Set(),
  );
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    activities: "",
    selectedEnquiries: [] as string[],
  });

  const currentUser = users.find((u) => u.id === currentUserId);
  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
  const paginatedReports = reports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleToggleEnquiry = (enquiryId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedEnquiries: prev.selectedEnquiries.includes(enquiryId)
        ? prev.selectedEnquiries.filter((id) => id !== enquiryId)
        : [...prev.selectedEnquiries, enquiryId],
    }));
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.date && formData.activities && currentUser) {
      const enquiriesHandled = enquiries
        .filter((e) => formData.selectedEnquiries.includes(e.id))
        .map((e) => ({
          enquiryId: e.id,
          studentName: e.studentName,
          action: "Handled",
        }));

      onAddReport({
        userId: currentUser.id,
        userName: currentUser.fullName,
        date: formData.date,
        activities: formData.activities,
        enquiriesHandled,
      });

      setFormData({
        date: new Date().toISOString().split("T")[0],
        activities: "",
        selectedEnquiries: [],
      });
      setShowAddForm(false);
    }
  };

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const sortedReports = [...paginatedReports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Daily Reports</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Submit Report
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Submit Daily Report</h3>
          <form onSubmit={handleAddReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Report Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Submitted By
                </label>
                <Input
                  value={currentUser?.fullName || "N/A"}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Activities/Tasks Done Today *
              </label>
              <textarea
                value={formData.activities}
                onChange={(e) =>
                  setFormData({ ...formData, activities: e.target.value })
                }
                placeholder="Describe what you did today..."
                className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground min-h-24 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-3">
                Inquiries Handled
              </label>
              <div className="border border-border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {enquiries.length > 0 ? (
                  enquiries.map((enquiry) => (
                    <div
                      key={enquiry.id}
                      className="flex items-start gap-2 p-2 hover:bg-muted rounded"
                    >
                      <input
                        type="checkbox"
                        id={`enquiry-${enquiry.id}`}
                        checked={formData.selectedEnquiries.includes(
                          enquiry.id,
                        )}
                        onChange={() => handleToggleEnquiry(enquiry.id)}
                        className="mt-1 rounded"
                      />
                      <label
                        htmlFor={`enquiry-${enquiry.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-sm">
                          {enquiry.studentName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {enquiry.desiredProgram}
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No inquiries available
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                Submit Report
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    activities: "",
                    selectedEnquiries: [],
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {sortedReports.length > 0 ? (
          sortedReports.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleReportExpansion(report.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {expandedReports.has(report.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold">{report.userName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                {currentRole === "admin" && (
                  <Button
                    onClick={() => onDeleteReport(report.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {expandedReports.has(report.id) && (
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-primary">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Daily Activities
                    </h4>
                    <p className="text-sm whitespace-pre-wrap text-foreground/80">
                      {report.activities}
                    </p>
                  </div>

                  {report.enquiriesHandled.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        Inquiries Handled
                      </h4>
                      <div className="space-y-2">
                        {report.enquiriesHandled.map((enquiry) => (
                          <div
                            key={enquiry.enquiryId}
                            className="text-sm p-2 bg-muted rounded"
                          >
                            <span className="font-medium">
                              {enquiry.studentName}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              - {enquiry.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Submitted: {new Date(report.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            No reports submitted yet
          </Card>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
