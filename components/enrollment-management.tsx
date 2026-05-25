"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { Student, Major, Intake, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronDown, Download, Edit, Plus, Trash2, X } from "lucide-react";
import { filterStudents, searchStudentsAdmission } from "@/lib/search-utils";
import { isValidEmailDomain } from "@/lib/dns-validator";
import { toast } from "sonner";
import { nrcData } from "@/asset/nrc_data";
import { locationData } from "@/asset/location_Data";
import { EntityList } from "@/components/entity-list";
import type { EntityListConfig } from "@/types/forms";

interface EnrollmentManagementProps {
  students: Student[];
  majors: Major[];
  intakes: Intake[];
  currentRole: UserRole;
  onViewDetail?: (student: Student) => void;
  onUpdate: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  onEnrollStudent: (student: Omit<Student, "id">) => void;
}

export function EnrollmentManagement({
  students,
  majors,
  intakes,
  currentRole,
  onViewDetail,
  onUpdate,
  onDelete,
  onEnrollStudent,
}: EnrollmentManagementProps) {
  const [showEnrollForm, setShowEnrollForm] = useState<boolean>(false);
  const [showEnrollFormEdit, setShowEnrollFormEdit] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    gender: "",
    nrc: "",
    birthDate: "",
    studentPhoneNo: "",
    email: "",
    educationLevel: "",
    majorId: "",
    intakeId: "",
    scholar: false,
    parentName: "",
    parentPhoneNo: "",
    registrationFee: false,
    firstInstallmentFee: false,
    referralName: "",
    remark: "",
    nrcCopy: false,
    censusCopy: false,
    passportPhoto: false,
    educationCertificate: false,
    enrolledDate: new Date().toISOString().split("T")[0],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [nrcComponents, setNrcComponents] = useState({
    state: "",
    township: "MAKANA",
    number: "",
  });
  const [filters, setFilters] = useState({
    major: "",
    intake: "",
    status: "",
    gender: "",
    informationStatus: "",
    scholar: "",
  });

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [townships, setTownships] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [street, setStreet] = useState<string>("");

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value as keyof typeof locationData;
    setSelectedRegion(region);
    setCities(locationData[region] || []);
  };
  const handleNRCStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value as keyof typeof nrcData;
    setNrcComponents({ ...nrcComponents, state });
    setTownships((nrcData[state] || []).map((twp) => twp.short));
  };

  let filteredStudents = searchStudentsAdmission(students, searchQuery);
  filteredStudents = filterStudents(filteredStudents, {
    major: filters.major || undefined,
    intake: filters.intake || undefined,
    status: filters.status || undefined,
    gender: filters.gender || undefined,
    informationStatus: filters.informationStatus || undefined,
    scholar: filters.scholar ? filters.scholar === "true" : undefined,
  });

  const handleExportCSV = () => {
    const headers = [
      "No", "Name", "Edu lvl", "Gender", "NRC", "Birth Date", "Program",
      "Student Ph No.", "Parent Name", "Parent Ph No.", "Email", "Scholar",
      "Enrolled Date", "NRC copy", "Census copy", "Passport Photo",
      "Education Certificate", "Referral Name", "Status", "Semester", "Remark",
    ];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.fullName, s.educationLevel, s.gender, s.nrc, s.birthDate,
      majors.find((m) => m.id === s.majorId)?.name || "",
      s.studentPhoneNo, s.parentName, s.parentPhoneNo, s.email,
      s.scholar ? "Yes" : "No", s.enrolledDate,
      s.nrcCopy ? "Yes" : "No", s.censusCopy ? "Yes" : "No",
      s.passportPhoto ? "Yes" : "No", s.educationCertificate ? "Yes" : "No",
      s.referralName || "", s.status, s.remark || "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const activeFilters = Object.values(filters).filter((f) => f !== "").length;

  function combineNRC(state: string, township: string, type: string, serial: string) {
    return `${state}/${township}(${type})${serial}`;
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await isValidEmailDomain(formData.email))) {
      toast.error("Email is not valid");
      return;
    }
    if (
      formData.fullName &&
      nrcComponents.number &&
      nrcComponents.state &&
      nrcComponents.township &&
      selectedRegion &&
      selectedCity &&
      street &&
      formData.intakeId &&
      formData.birthDate &&
      formData.email &&
      formData.parentName &&
      formData.parentPhoneNo &&
      formData.studentPhoneNo
    ) {
      const payload: Omit<Student, "id"> = {
        fullName: formData.fullName,
        street,
        city: selectedCity,
        region: selectedRegion,
        educationLevel: formData.educationLevel,
        gender: formData.gender as "Male" | "Female" | "Other",
        nrc: combineNRC(nrcComponents.state, nrcComponents.township, "N", nrcComponents.number),
        birthDate: formData.birthDate,
        studentPhoneNo: formData.studentPhoneNo,
        parentName: formData.parentName,
        parentPhoneNo: formData.parentPhoneNo,
        email: formData.email,
        scholar: formData.scholar,
        firstInstallmentFee: formData.firstInstallmentFee,
        registrationFee: formData.registrationFee,
        remark: formData.remark,
        enrolledDate: formData.enrolledDate,
        referralName: formData.referralName,
        nrcCopy: formData.nrcCopy,
        censusCopy: formData.censusCopy,
        passportPhoto: formData.passportPhoto,
        educationCertificate: formData.educationCertificate,
        intakeId: formData.intakeId,
        status: "Enrolled",
      };

      if (showEnrollFormEdit) {
        onUpdate({ ...payload, id: formData.id });
        setShowEnrollFormEdit(false);
      } else {
        onEnrollStudent({ ...payload, intakeCode: "" });
        setShowEnrollForm(false);
      }

      setFormData({
        id: "", fullName: "", educationLevel: "", gender: "", nrc: "",
        birthDate: "", studentPhoneNo: "", parentName: "", parentPhoneNo: "",
        email: "", scholar: false, enrolledDate: new Date().toISOString().split("T")[0],
        nrcCopy: false, censusCopy: false, passportPhoto: false,
        educationCertificate: false, firstInstallmentFee: false,
        registrationFee: false, referralName: "", remark: "",
        majorId: "", intakeId: "",
      });
      setNrcComponents({ state: "", township: "", number: "" });
      setSelectedCity("");
      setSelectedRegion("");
      setStreet("");
    } else {
      toast.error("Please fill all required fields");
    }
  };

  function splitNRC(nrcString: string) {
    const nrcRegex = /^(\d+)\/([A-Z]+)\(([N|P|E])\)(\d+)$/;
    const match = nrcString.match(nrcRegex) || [];
    if (!match) console.log("Invalid NRC format provided.");
    return {
      stateNumber: match[1],
      townshipCode: match[2],
      nrcType: match[3],
      serialNumber: match[4],
      formattedTownship: `${match[1]} ${match[2]}`,
      justSerial: match[4],
    };
  }

  const handleUpdate = (student: Student) => {
    setShowEnrollFormEdit(true);
    const nrc = splitNRC(student.nrc);
    const state = nrc.stateNumber as keyof typeof nrcData;
    setTownships((nrcData[state] || []).map((twp) => (typeof twp === "string" ? twp : twp.short)));
    setNrcComponents({ state: nrc.stateNumber, township: nrc.townshipCode, number: nrc.serialNumber });

    const region = student.region as keyof typeof locationData;
    setCities(locationData[region] || []);
    setSelectedRegion(student.region || "");
    setSelectedCity(student.city || "");
    setStreet(student.street || "");

    setFormData({
      id: student.id, fullName: student.fullName, gender: student.gender,
      nrc: student.nrc, birthDate: student.birthDate,
      studentPhoneNo: student.studentPhoneNo, email: student.email,
      educationLevel: student.educationLevel,
      majorId: student.majorId || "", intakeId: student.intakeId,
      scholar: student.scholar, parentName: student.parentName,
      parentPhoneNo: student.parentPhoneNo,
      registrationFee: student.registrationFee,
      firstInstallmentFee: student.firstInstallmentFee,
      referralName: student.referralName || "", remark: student.remark || "",
      nrcCopy: student.nrcCopy, censusCopy: student.censusCopy,
      passportPhoto: student.passportPhoto,
      educationCertificate: student.educationCertificate,
      enrolledDate: student.enrolledDate,
    });
  };

  const cancelEnrollment = () => {
    setShowEnrollForm(false);
    setShowEnrollFormEdit(false);
    setFormData({
      id: "", fullName: "", gender: "", nrc: "", birthDate: "",
      studentPhoneNo: "", email: "", educationLevel: "", majorId: "", intakeId: "",
      scholar: false, parentName: "", parentPhoneNo: "",
      registrationFee: false, firstInstallmentFee: false,
      referralName: "", remark: "",
      nrcCopy: false, censusCopy: false, passportPhoto: false,
      educationCertificate: false,
      enrolledDate: new Date().toISOString().split("T")[0],
    });
    setNrcComponents({ state: "", township: "", number: "" });
    setSelectedCity("");
    setSelectedRegion("");
    setStreet("");
  };

  const lastClickRef = useRef<number>(0);
  const handleDoubleClickFallback = useCallback(
    (student: Student) => {
      const currentTime = Date.now();
      const delay = 300;
      if (currentTime - lastClickRef.current < delay) {
        onViewDetail?.(student);
        lastClickRef.current = 0;
        return;
      }
      lastClickRef.current = currentTime;
    },
    [onViewDetail],
  );

  const canEdit = currentRole === "Admissions" || currentRole === "staff";

  const listConfig: EntityListConfig<Student> = {
    columns: [
      { key: "fullName", header: "Name", sortable: true },
      { key: "nrc", header: "NRC" },
      { key: "gender", header: "Gender" },
      { key: "email", header: "Email", render: (s) => <span className="text-muted-foreground">{s.email}</span> },
      { key: "majorName", header: "Program" },
      {
        key: "status", header: "Status",
        render: (s) => (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            s.status === "Enrolled" ? "bg-accent/20 text-accent"
            : s.status === "Graduated" ? "bg-emerald-600/20 text-emerald-600"
            : s.status === "Dropout" ? "bg-destructive/20 text-destructive"
            : s.status === "Interrupted" ? "bg-warning/20 text-warning"
            : "bg-muted text-muted-foreground"
          }`}>
            {s.status}
          </span>
        ),
      },
      {
        key: "scholar", header: "Scholar",
        render: (s) => s.scholar ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-success" />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-muted-foreground" />
            No
          </span>
        ),
      },
    ],
    searchFields: ["fullName", "nrc", "email", "majorName", "status"],
    itemsPerPage: 10,
    onRowClick: (student) => handleDoubleClickFallback(student),
    rowActions: canEdit
      ? (student: Student) => (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/80"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUpdate(student); }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/80"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteTarget(student.id); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      : undefined,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Button onClick={() => setShowEnrollForm(!showEnrollForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Enroll New Student
          </Button>
          <Input
            placeholder="Search by name, NRC, email, major, intake, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-background text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setExpandedFilters(!expandedFilters)} variant="outline" className="gap-2 bg-background flex-1">
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedFilters ? "rotate-180" : ""}`} />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 bg-background flex-1">
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
                <select value={filters.major} onChange={(e) => setFilters({ ...filters, major: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                  <option value="">All Majors</option>
                  {majors.map((m) => <option key={m.id} value={m.name}>{m.code} - {m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Gender</label>
                <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Scholar</label>
                <select value={filters.scholar} onChange={(e) => setFilters({ ...filters, scholar: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                  <option value="">All Students</option>
                  <option value="true">Scholars</option>
                  <option value="false">Non-Scholars</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Intake</label>
                <select value={filters.intake} onChange={(e) => setFilters({ ...filters, intake: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                  <option value="">All Intakes</option>
                  {intakes.map((i) => <option key={i.id} value={i.id}>{i.code}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Status</label>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                  <option value="">All Status</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Dropout">Dropped Out</option>
                  <option value="Interrupted">Interrupted</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Information Status</label>
                <select value={filters.informationStatus} onChange={(e) => setFilters({ ...filters, informationStatus: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                  <option value="">Not Selected</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>
            {activeFilters > 0 && (
              <Button onClick={() => setFilters({ major: "", intake: "", informationStatus: "", status: "", gender: "", scholar: "" })} variant="ghost" size="sm" className="mt-4 gap-1 hover:bg-primary/80">
                <X className="h-4 w-4" />
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {(showEnrollForm || showEnrollFormEdit) && (
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-xl font-semibold mb-4">New Enrollment</h2>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Full Name *</label>
                <Input placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">NRC *</label>
                <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
                  <select onChange={handleNRCStateChange} value={nrcComponents.state} className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                    <option value="">Select State</option>
                    {Object.keys(nrcData).map((reg) => <option key={reg} value={reg}>{reg}</option>)}
                  </select>
                  <select value={nrcComponents.township} disabled={!townships.length} onChange={(e) => setNrcComponents({ ...nrcComponents, township: e.target.value })} className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                    <option value="">Select City</option>
                    {townships.map((ts, index) => <option key={index} value={ts}>{ts}</option>)}
                  </select>
                  <Input value={nrcComponents.number} required placeholder="123456" maxLength={6} minLength={6} onChange={(e) => setNrcComponents({ ...nrcComponents, number: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Birth Date</label>
                <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Address</label>
                <Input placeholder="Address" value={street} onChange={(e) => setStreet(e.target.value)} required />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">Region</label>
                  <select onChange={handleRegionChange} value={selectedRegion} className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                    <option value="">Select Region</option>
                    {Object.keys(locationData).map((reg) => <option key={reg} value={reg}>{reg}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">City</label>
                  <select onChange={(e) => setSelectedCity(e.target.value)} value={selectedCity} disabled={!cities.length} className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground">
                    <option value="">Select City</option>
                    {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Student Phone</label>
                <Input placeholder="Student Phone Number" value={formData.studentPhoneNo} onChange={(e) => setFormData({ ...formData, studentPhoneNo: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Email</label>
                <Input required type="email" placeholder="Student Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Education Level</label>
                <Input required value={formData.educationLevel} onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })} placeholder="e.g., High School, Diploma" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Intake *</label>
                <select value={formData.intakeId} onChange={(e) => setFormData({ ...formData, intakeId: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Select Intake</option>
                  {intakes.map((i) => <option key={i.id} value={i.id}>{i.code} ({majors.find((m) => m.id === i.majorId)?.name})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Parent/Guardian Name</label>
                <Input required placeholder="Parent Name" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Parent Phone</label>
                <Input required placeholder="Parent Phone Number" value={formData.parentPhoneNo} onChange={(e) => setFormData({ ...formData, parentPhoneNo: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Scholarship</label>
                <select value={formData.scholar === true ? "yes" : formData.scholar === false ? "no" : ""} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, scholar: val === "yes" }); }} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Registration Fee</label>
                <select value={formData.registrationFee === true ? "yes" : formData.registrationFee === false ? "no" : ""} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, registrationFee: val === "yes" }); }} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">First Installment</label>
                <select value={formData.firstInstallmentFee === true ? "yes" : formData.firstInstallmentFee === false ? "no" : ""} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, firstInstallmentFee: val === "yes" }); }} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Referral Name</label>
                <Input placeholder="Referral Name" value={formData.referralName} onChange={(e) => setFormData({ ...formData, referralName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">NRC Copy</label>
                <select value={formData.nrcCopy === true ? "yes" : formData.nrcCopy === false ? "no" : ""} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, nrcCopy: val === "yes" }); }} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Census Copy</label>
                <select value={formData.censusCopy === true ? "yes" : formData.censusCopy === false ? "no" : ""} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, censusCopy: val === "yes" }); }} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Passport Photo</label>
                <select value={formData.passportPhoto === true ? "yes" : formData.passportPhoto === false ? "no" : ""} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, passportPhoto: val === "yes" }); }} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Education Certificate</label>
                <select value={formData.educationCertificate === true ? "yes" : formData.educationCertificate === false ? "no" : ""} onChange={(e) => { const val = e.target.value; setFormData({ ...formData, educationCertificate: val === "yes" }); }} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" required>
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-2">Remark</label>
                <textarea placeholder="Remark" value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm" rows={3} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {showEnrollFormEdit ? "Update Enrollment" : "Enroll Student"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEnrollment}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Records ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityList
            config={listConfig}
            data={filteredStudents}
            isLoading={false}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Allow to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to allow this student to be deleted permanently?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) onDelete?.(deleteTarget); setDeleteTarget(null); }}>
              Allow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
