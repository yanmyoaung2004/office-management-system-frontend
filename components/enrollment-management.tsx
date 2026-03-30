"use client";

import type React from "react";

import { useCallback, useRef, useState } from "react";
import type { Student, Major, Intake, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Download, Edit, Plus, Trash2, X } from "lucide-react";
import { filterStudents, searchStudents } from "@/lib/search-utils";
import { Pagination } from "./pagination";
import { ConfirmationPopup } from "./confirmation-popup";
import { isValidEmailDomain } from "@/lib/dns-validator";
import { toast } from "sonner";
import { nrcData } from "@/asset/nrc_data";
import { locationData } from "@/asset/location_Data";

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
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

  let filteredStudents = searchStudents(students, searchQuery);
  filteredStudents = filterStudents(filteredStudents, {
    major: filters.major || undefined,
    intake: filters.intake || undefined,
    status: filters.status || undefined,
    gender: filters.gender || undefined,
    informationStatus: filters.informationStatus || undefined,
    scholar: filters.scholar ? filters.scholar === "true" : undefined,
  });

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleExportCSV = () => {
    const headers = [
      "No",
      "Name",
      "Edu lvl",
      "Gender",
      "NRC",
      "Birth Date",
      "Program",
      "Student Ph No.",
      "Parent Name",
      "Parent Ph No.",
      "Email",
      "Scholar",
      "Enrolled Date",
      "NRC copy",
      "Census copy",
      "Passport Photo",
      "Education Certificate",
      "Referral Name",
      "Status",
      "Semester",
      "Remark",
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.fullName,
      s.educationLevel,
      s.gender,
      s.nrc,
      s.birthDate,
      majors.find((m) => m.id === s.majorId)?.name || "",
      s.studentPhoneNo,
      s.parentName,
      s.parentPhoneNo,
      s.email,
      s.scholar ? "Yes" : "No",
      s.enrolledDate,
      s.nrcCopy ? "Yes" : "No",
      s.censusCopy ? "Yes" : "No",
      s.passportPhoto ? "Yes" : "No",
      s.educationCertificate ? "Yes" : "No",
      s.referralName || "",
      s.status,
      s.remark || "",
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

  function combineNRC(
    state: string,
    township: string,
    type: string,
    serial: string,
  ) {
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
      if (showEnrollFormEdit) {
        onUpdate({
          id: formData.id,
          fullName: formData.fullName,
          street: street,
          city: selectedCity,
          region: selectedRegion,
          educationLevel: formData.educationLevel,
          gender: formData.gender as "Male" | "Female" | "Other",
          nrc: combineNRC(
            nrcComponents.state,
            nrcComponents.township,
            "N",
            nrcComponents.number,
          ),
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
        });
        setShowEnrollFormEdit(false);
      } else {
        onEnrollStudent({
          street: street,
          city: selectedCity,
          region: selectedRegion,
          fullName: formData.fullName,
          educationLevel: formData.educationLevel,
          gender: formData.gender as "Male" | "Female" | "Other",
          nrc: combineNRC(
            nrcComponents.state,
            nrcComponents.township,
            "N",
            nrcComponents.number,
          ),
          birthDate: formData.birthDate,
          studentPhoneNo: formData.studentPhoneNo,
          parentName: formData.parentName,
          parentPhoneNo: formData.parentPhoneNo,
          email: formData.email,
          scholar: formData.scholar,
          firstInstallmentFee: formData.firstInstallmentFee,
          registrationFee: formData.registrationFee,
          enrolledDate: formData.enrolledDate,
          nrcCopy: formData.nrcCopy,
          censusCopy: formData.censusCopy,
          passportPhoto: formData.passportPhoto,
          educationCertificate: formData.educationCertificate,
          referralName: formData.referralName,
          remark: formData.remark,
          intakeId: formData.intakeId,
          intakeCode: "",
          status: "Enrolled",
        });
        setShowEnrollForm(false);
      }
      setFormData({
        id: "",
        fullName: "",
        educationLevel: "",
        gender: "",
        nrc: "",
        birthDate: "",
        studentPhoneNo: "",
        parentName: "",
        parentPhoneNo: "",
        email: "",
        scholar: false,
        enrolledDate: new Date().toISOString().split("T")[0],
        nrcCopy: false,
        censusCopy: false,
        passportPhoto: false,
        educationCertificate: false,
        firstInstallmentFee: false,
        registrationFee: false,
        referralName: "",
        remark: "",
        majorId: "",
        intakeId: "",
      });
      setNrcComponents({
        state: "",
        township: "",
        number: "",
      });
      setSelectedCity("");
      setSelectedRegion("");
      setStreet("");
    } else {
      toast.error("Please fill all required fields");
    }
  };

  function splitNRC(nrcString: string) {
    const nrcRegex = /^(\d+)\/([A-Z]+)\(([N|P|E])\)(\d+)$/;
    const match = nrcString.match(nrcRegex);
    if (!match) {
      console.log("Invalid NRC format provided.");
    }
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
    setTownships(
      (nrcData[state] || []).map((twp) =>
        typeof twp === "string" ? twp : twp.short,
      ),
    );
    setNrcComponents({
      state: nrc.stateNumber,
      township: nrc.townshipCode,
      number: nrc.serialNumber,
    });

    const region = student.region as keyof typeof locationData;
    setCities(locationData[region] || []);
    setSelectedRegion(student.region || "");
    setSelectedCity(student.city || "");
    setStreet(student.street || "");

    setFormData({
      id: student.id,
      fullName: student.fullName,
      gender: student.gender,
      nrc: student.nrc,
      birthDate: student.birthDate,
      studentPhoneNo: student.studentPhoneNo,
      email: student.email,
      educationLevel: student.educationLevel,
      majorId: student.majorId || "",
      intakeId: student.intakeId,
      scholar: student.scholar,
      parentName: student.parentName,
      parentPhoneNo: student.parentPhoneNo,
      registrationFee: student.registrationFee,
      firstInstallmentFee: student.firstInstallmentFee,
      referralName: student.referralName || "",
      remark: student.remark || "",
      nrcCopy: student.nrcCopy,
      censusCopy: student.censusCopy,
      passportPhoto: student.passportPhoto,
      educationCertificate: student.educationCertificate,
      enrolledDate: student.enrolledDate,
    });
  };

  const cancelEnrollment = () => {
    setShowEnrollForm(false);
    setShowEnrollFormEdit(false);
    setFormData({
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
    setNrcComponents({
      state: "",
      township: "",
      number: "",
    });
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Button
            onClick={() => setShowEnrollForm(!showEnrollForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Enroll New Student
          </Button>
          <Input
            placeholder="Search by name, NRC, email, major, intake, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setExpandedFilters(!expandedFilters)}
            variant="outline"
            className="gap-2 bg-white flex-1"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedFilters ? "rotate-180" : ""}`}
            />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2  bg-white flex-1"
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
                  onChange={(e) =>
                    setFilters({ ...filters, major: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">All Majors</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) =>
                    setFilters({ ...filters, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Scholar
                </label>
                <select
                  value={filters.scholar}
                  onChange={(e) =>
                    setFilters({ ...filters, scholar: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">All Students</option>
                  <option value="true">Scholars</option>
                  <option value="false">Non-Scholars</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Intake</label>
                <select
                  value={filters.intake}
                  onChange={(e) =>
                    setFilters({ ...filters, intake: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">All Intakes</option>
                  {intakes.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">All Status</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Dropout">Dropped Out</option>
                  <option value="Interrupted">Interrupted</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Information Status
                </label>
                <select
                  value={filters.informationStatus}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      informationStatus: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">Not Selected</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>

            {activeFilters > 0 && (
              <Button
                onClick={() =>
                  setFilters({
                    major: "",
                    intake: "",
                    informationStatus: "",
                    status: "",
                    gender: "",
                    scholar: "",
                  })
                }
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

      {(showEnrollForm || showEnrollFormEdit) && (
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-xl font-semibold mb-4">New Enrollment</h2>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Full Name *
                </label>
                <Input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">NRC *</label>
                <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
                  <select
                    onChange={handleNRCStateChange}
                    value={nrcComponents.state}
                    className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                  >
                    <option value="">Select State</option>
                    {Object.keys(nrcData).map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                  <select
                    value={nrcComponents.township}
                    disabled={!townships.length}
                    onChange={(e) =>
                      setNrcComponents({
                        ...nrcComponents,
                        township: e.target.value,
                      })
                    }
                    className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                  >
                    <option value="">Select City</option>
                    {townships.map((ts, index) => (
                      <option key={index} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={nrcComponents.number}
                    required
                    placeholder="123456"
                    maxLength={6}
                    minLength={6}
                    onChange={(e) =>
                      setNrcComponents({
                        ...nrcComponents,
                        number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Birth Date
                </label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Address
                </label>
                <Input
                  placeholder="Address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">
                    Region
                  </label>
                  <select
                    onChange={handleRegionChange}
                    value={selectedRegion}
                    className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                  >
                    <option value="">Select Region</option>
                    {Object.keys(locationData).map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">City</label>
                  <select
                    onChange={(e) => setSelectedCity(e.target.value)}
                    value={selectedCity}
                    disabled={!cities.length}
                    className="text-sm w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Student Phone
                </label>
                <Input
                  placeholder="Student Phone Number"
                  value={formData.studentPhoneNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentPhoneNo: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Email</label>
                <Input
                  required
                  type="email"
                  placeholder="Student Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Education Level
                </label>
                <Input
                  required
                  value={formData.educationLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      educationLevel: e.target.value,
                    })
                  }
                  placeholder="e.g., High School, Diploma"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Intake *
                </label>
                <select
                  value={formData.intakeId}
                  onChange={(e) =>
                    setFormData({ ...formData, intakeId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Select Intake</option>
                  {intakes.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} ({majors.find((m) => m.id === i.majorId)?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Parent/Guardian Name
                </label>
                <Input
                  required
                  placeholder="Parent Name"
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Parent Phone
                </label>
                <Input
                  required
                  placeholder="Parent Phone Number"
                  value={formData.parentPhoneNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentPhoneNo: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Scholarship
                </label>
                <select
                  value={
                    formData.scholar === true
                      ? "yes"
                      : formData.scholar === false
                        ? "no"
                        : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      scholar: val === "yes",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Registration Fee
                </label>
                <select
                  value={
                    formData.registrationFee === true
                      ? "yes"
                      : formData.registrationFee === false
                        ? "no"
                        : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      registrationFee: val === "yes",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  First Installment
                </label>
                <select
                  value={
                    formData.firstInstallmentFee === true
                      ? "yes"
                      : formData.firstInstallmentFee === false
                        ? "no"
                        : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      firstInstallmentFee: val === "yes",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Referral Name
                </label>
                <Input
                  placeholder="Referral Name"
                  value={formData.referralName}
                  onChange={(e) =>
                    setFormData({ ...formData, referralName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  NRC Copy
                </label>
                <select
                  value={
                    formData.nrcCopy === true
                      ? "yes"
                      : formData.nrcCopy === false
                        ? "no"
                        : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      nrcCopy: val === "yes",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Census Copy
                </label>
                <select
                  value={
                    formData.censusCopy === true
                      ? "yes"
                      : formData.censusCopy === false
                        ? "no"
                        : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      censusCopy: val === "yes",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Passport Photo
                </label>
                <select
                  value={
                    formData.passportPhoto === true
                      ? "yes"
                      : formData.passportPhoto === false
                        ? "no"
                        : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      passportPhoto: val === "yes",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Education Certificate
                </label>
                <select
                  value={
                    formData.educationCertificate === true
                      ? "yes"
                      : formData.educationCertificate === false
                        ? "no"
                        : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      educationCertificate: val === "yes",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  required
                >
                  <option value="">Not Selected</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-2">Remark</label>
                <textarea
                  placeholder="Remark"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {showEnrollFormEdit ? "Update Enrollment" : "Enroll Student"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEnrollment}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Student Records ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">NRC</th>
                  <th className="text-left py-3 px-4 font-semibold">Gender</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Program</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Scholar</th>
                  {(currentRole === "admin" || currentRole === "staff") && (
                    <th className="text-left py-3 px-4 font-semibold">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No students found
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors select-none"
                      onClick={() => {
                        handleDoubleClickFallback(student);
                      }}
                    >
                      <td className="py-3 px-4 font-medium">
                        {student.fullName}
                      </td>
                      <td className="py-3 px-4">{student.nrc}</td>
                      <td className="py-3 px-4">{student.gender}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="py-3 px-4">{student.majorName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            student.status === "Enrolled"
                              ? "bg-accent/20 text-accent"
                              : student.status === "Graduated"
                                ? "bg-emerald-600/20 text-emerald-600"
                                : student.status === "Dropout"
                                  ? "bg-destructive/20 text-destructive"
                                  : student.status === "Interrupted"
                                    ? "bg-yellow-400/20 text-yellow-600"
                                    : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {student.scholar ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500"></span>
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-gray-400"></span>
                            No
                          </span>
                        )}
                      </td>

                      {(currentRole === "admin" || currentRole === "staff") && (
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => {
                              handleUpdate(student);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <ConfirmationPopup
                            itemId={student.id}
                            onAllow={() => onDelete?.(student.id)}
                            onCancel={() => {}}
                            onButtonText=""
                            onButtonVariant="ghost"
                            onAllowButtonText="Allow"
                            onCancelButtonText="Don't allow"
                            primaryText="Allow to delete?"
                            description="Do you want to allow this intake to be deleted permanently?"
                            buttonIcon={Trash2}
                            buttonClass={
                              "justify-start text-destructive hover:bg-destructive/80"
                            }
                            iconClass="h-4 w-4"
                          />
                        </td>
                      )}
                    </tr>
                  ))
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
