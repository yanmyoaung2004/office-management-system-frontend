"use client";

import type React from "react";
import { useState } from "react";
import type { Major, Semester, Year } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Download, Edit, Plus, Trash2 } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { Textarea } from "./ui/textarea";
import { ConfirmationPopup } from "./confirmation-popup";
import { searchMajors } from "@/lib/search-utils";
import { toast } from "sonner";
import { handleExportCSV } from "@/lib/utils";
import { SubjectManagement } from "./subject-management";

const ITEMS_PER_PAGE = 6;

interface IntakeManagementProps {
  majors: Major[];
  onAddMajor: (major: Omit<Major, "id">) => void;
  onUpdateMajor: (major: Major) => void;
  onDeleteMajor: (majorId: string) => void;
}

export function MajorManagement({
  majors,
  onAddMajor,
  onDeleteMajor,
  onUpdateMajor,
}: IntakeManagementProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showFormEdit, setShowFormEdit] = useState<boolean>(false);
  const [years, setYears] = useState<Year[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [subjectManagementMajor, setSubjectManagementMajor] =
    useState<Major | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    code: "",
  });

  const filteredMajors = searchMajors(majors, searchQuery);
  const totalPages = Math.ceil(filteredMajors.length / ITEMS_PER_PAGE);
  const paginatedMajors = filteredMajors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.code && formData.name && formData.description) {
      if (showFormEdit) {
        onUpdateMajor({
          id: formData.id,
          code: formData.code,
          name: formData.name,
          description: formData.description,
          years: years,
        });
        setShowFormEdit(false);
      } else {
        onAddMajor({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          years: years,
        });
        setShowForm(false);
      }
      setFormData({ id: "", code: "", name: "", description: "" });
      setYears([]);
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const nextYearNumber = () =>
    years.filter((y) => y.type === "NORMAL").length + 1;

  const addYear = () => {
    const hasFoundation = years.some((y) => y.type === "FOUNDATION");
    if (!hasFoundation) {
      setYears((prev) => [
        ...prev,
        {
          id: "",
          type: "FOUNDATION",
          yearNumber: null,
          name: "Foundation",
          semesters: [],
        },
      ]);
      return;
    }

    const yearNumber = nextYearNumber();

    setYears((prev) => [
      ...prev,
      {
        id: "",
        type: "NORMAL",
        yearNumber,
        name: `Year ${yearNumber}`,
        semesters: [],
      },
    ]);
  };

  const updateYearName = (index: number, value: string) => {
    setYears((prev) =>
      prev.map((y, i) => (i === index ? { ...y, name: value } : y)),
    );
  };

  const addSemester = (yearIndex: number) => {
    setYears((prev) =>
      prev.map((y, i) =>
        i === yearIndex
          ? {
              ...y,
              semesters: [
                ...y.semesters,
                {
                  semesterNumber: y.semesters.length + 1,
                  name: `Semester ${y.semesters.length + 1}`,
                } as Semester,
              ],
            }
          : y,
      ),
    );
  };

  const deleteSemester = (yearIndex: number, semIndex: number) => {
    setYears((prev) =>
      prev.map((y, i) =>
        i === yearIndex
          ? {
              ...y,
              semesters: y.semesters.filter((_, j) => j !== semIndex),
            }
          : y,
      ),
    );
  };

  const updateSemesterName = (
    yearIndex: number,
    semIndex: number,
    value: string,
  ) => {
    setYears((prev) =>
      prev.map((y, i) =>
        i === yearIndex
          ? {
              ...y,
              semesters: y.semesters.map((s, j) =>
                j === semIndex ? { ...s, name: value } : s,
              ),
            }
          : y,
      ),
    );
  };

  const handleMajorsExportCSV = () => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Button
            onClick={() => setShowForm((prev) => !prev)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Major
          </Button>
          <Input
            placeholder="Search by name, code, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white text-sm"
          />
        </div>

        <Button
          onClick={handleMajorsExportCSV}
          variant="outline"
          className="gap-2  bg-white"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {(showForm || showFormEdit) && (
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-xl font-semibold mb-4">New Major</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Name *</label>
                <Input
                  placeholder="Name a major"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Code *</label>
                <Input
                  placeholder="Major Code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium block mb-2">
                  Description *
                </label>
                <Textarea
                  required
                  placeholder="Major Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-2 space-y-4">
                <label className="text-sm font-medium block">Duration *</label>
                {/* <div className="grid grid-cols-2 w-full">
                  <select
                    className="px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                    required
                  >
                    <option value="">Not Selected</option>
                    <option value="new">Create new</option>
                    <option value="old">User saved one</option>
                  </select>
                </div> */}
                {years.map((year, yearIndex) => (
                  <div
                    key={yearIndex}
                    className="border rounded-md p-4 space-y-3"
                  >
                    <input
                      type="text"
                      value={year.name}
                      onChange={(e) =>
                        updateYearName(yearIndex, e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md text-sm font-medium"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-1.5">
                      {year.semesters.map((sem, semIndex) => (
                        <div className="relative w-full group" key={semIndex}>
                          <input
                            type="text"
                            placeholder="Enter file name"
                            value={sem.name}
                            onChange={(e) =>
                              updateSemesterName(
                                yearIndex,
                                semIndex,
                                e.target.value,
                              )
                            }
                            className="w-full px-3 pr-10 py-2 border rounded-md bg-transparent border-gray-600 text-sm"
                          />
                          <div
                            onClick={() => deleteSemester(yearIndex, semIndex)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addSemester(yearIndex)}
                      className="flex items-center gap-1 text-sm px-2 py-1 rounded-md border w-fit hover:bg-primary/90 hover:text-accent-foreground"
                    >
                      <Plus className="h-3 w-3" />
                      Add Semester
                    </button>
                  </div>
                ))}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addYear}
                    className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-md border w-fit hover:bg-primary/90 hover:text-accent-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    Add Year
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {showFormEdit ? "Update Major" : "Create Major"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setShowFormEdit(false);
                  setYears([]);
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
          <CardTitle>All Majors ({majors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Code</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Descirption
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMajors.length > 0 ? (
                  paginatedMajors.map((major) => (
                    <tr
                      key={major.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium">{major.name}</td>
                      <td className="py-3 px-4">{major.code}</td>
                      <td className="py-3 px-4">{major.description}</td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => {
                            setShowFormEdit(true);
                            setFormData(major);
                            setYears(major.years);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/80"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setSubjectManagementMajor(major)}
                          variant="ghost"
                          size="sm"
                          className="text-amber-500 hover:bg-amber-600"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <ConfirmationPopup
                          itemId={major.id}
                          onAllow={onDeleteMajor}
                          onCancel={() => {}}
                          onButtonText=""
                          onButtonVariant="ghost"
                          onAllowButtonText="Allow"
                          onCancelButtonText="Don't allow"
                          primaryText="Allow to delete?"
                          description="Do you want to allow this major to be deleted permanently?"
                          buttonIcon={Trash2}
                          buttonClass={
                            "text-destructive hover:bg-destructive/80"
                          }
                          iconClass="h-4 w-4"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No majors created
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
      {subjectManagementMajor && (
        <SubjectManagement
          major={subjectManagementMajor}
          open={!!subjectManagementMajor}
          onOpenChange={(v) => {
            if (!v) setSubjectManagementMajor(null);
          }}
        />
      )}
    </div>
  );
}
