"use client";

import type { Student, Major, Intake, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  CheckCircle2,
  AlertCircle,
  User,
  BookOpen,
  FileText,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  Info,
  Trophy,
  School,
  LocateFixed,
} from "lucide-react";
import { DetailItem } from "./utility-component";
import { DropoutModal, DropoutType } from "./dropout-modal";
import { CredentialType, ReactivateModal } from "./reactivate-modal";

interface StudentDetailProps {
  student: Student;
  majors: Major[];
  intakes: Intake[];
  currentRole: UserRole;
  onClose: () => void;
  onDropout?: (
    enrollmentId: string,
    reason: string,
    remark: string,
    type: DropoutType,
    followUpDate: string,
  ) => void;
  onReactivate: (
    credential: CredentialType,
    remark: string,
    intakeId: string,
  ) => void;
}

export function StudentDetail({
  student,
  currentRole,
  onClose,
  onDropout,
  intakes,
  onReactivate,
}: StudentDetailProps) {
  const getStatusConfig = (status: string) => {
    const styles: Record<string, string> = {
      Enrolled:
        "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
      Graduated: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20",
      "Dropped Out": "bg-red-50 text-red-700 border-red-200 ring-red-500/20",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div
      className="fixed inset-0 bg-background/80  flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-card/95 w-full max-w-5xl h-full max-h-[95vh] sm:h-auto overflow-hidden shadow-2xl border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden border-b bg-muted/30 px-6 py-8 ">
          <div className="absolute top-0 right-0 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className=" hover:bg-primary/80"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 ">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl rotate-3">
                {student.fullName.charAt(0)}
              </div>

              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border flex items-center justify-center shadow-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center  gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {student.fullName}
                </h2>
                <div>
                  {student.scholar && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-none font-bold py-0.5">
                      <Trophy className="h-3 w-3 mr-1" /> SCHOLAR
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <Badge
                  variant="outline"
                  className={`font-semibold border shadow-sm ${getStatusConfig(student.status)}`}
                >
                  {student.status}
                </Badge>
                <Separator
                  orientation="vertical"
                  className="h-4 hidden sm:block"
                />
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {student.majorName}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-0 overflow-y-auto max-h-[calc(95vh-160px)]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Main Information - 8 Units */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-10">
              {/* Grid: Personal Details */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-primary/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="h-4 w-4" /> Personal Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  <DetailItem
                    label="Email Address"
                    value={student.email}
                    icon={Mail}
                  />
                  <DetailItem
                    label="Contact No"
                    value={student.studentPhoneNo}
                    icon={Phone}
                  />
                  <DetailItem
                    label="Identification"
                    value={student.nrc}
                    icon={FileText}
                  />
                  <DetailItem
                    label="Birth Date"
                    value={new Date(student.birthDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                    icon={Calendar}
                  />
                  <DetailItem
                    label="Gender"
                    value={student.gender}
                    icon={User}
                  />
                  <DetailItem
                    label="Qualification"
                    value={student.educationLevel}
                    icon={BookOpen}
                  />
                  <DetailItem
                    label="Address"
                    value={
                      student.street
                        ? `${student.street}, ${student.city}, ${student.region}`
                        : ""
                    }
                    icon={LocateFixed}
                  />
                </div>
              </section>

              {/* Grid: Guardian & Referral */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-primary/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Info className="h-4 w-4" /> Support & Origin
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-2xl border border-border/50">
                  <DetailItem
                    label="Guardian Name"
                    value={student.parentName}
                    icon={User}
                  />
                  <DetailItem
                    label="Guardian Contact"
                    value={student.parentPhoneNo}
                    icon={Phone}
                  />
                  {student.referralName && (
                    <div className="sm:col-span-2">
                      <DetailItem
                        label="Referred By"
                        value={student.referralName}
                        icon={Briefcase}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Remarks */}
              {student.remark && (
                <section className="p-4 bg-primary/3 rounded-xl border border-primary/10 border-dashed">
                  <p className="text-xs font-bold text-primary/60 mb-2 uppercase tracking-widest">
                    Internal Remarks
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    &quot;{student.remark}&quot;
                  </p>
                </section>
              )}

              {student?.dropout && (
                <section className="p-4 rounded-xl">
                  {student?.dropout && (
                    <h3 className="text-xs font-black text-primary/40 uppercase tracking-[0.2em] flex items-center gap-2 mb-5">
                      <School className="h-4 w-4" />
                      {student?.dropout?.status === "Dropout" ? (
                        <>Dropout History</>
                      ) : (
                        <>Interrupted History</>
                      )}
                    </h3>
                  )}
                  <div className=" grid gap-4 bg-muted/30 rounded-xl py-2 border border-border border-dashed">
                    <div className="relative border-l-2 border-destructive/20 py-1">
                      <div className="mb-2 px-4">
                        <div className="grid grid-cols-2 mb-2 gap-y-2">
                          <span className="text-[12px] font-semibold uppercase block mb-1 col-span-2">
                            Intake : {student?.dropout?.intakeCode || "N/A"}
                          </span>
                          <span className="text-[12px] font-semibold uppercase block mb-1">
                            Enrolled Date : {student?.dropout?.enrolledDate}
                          </span>
                          <span className="text-[12px] font-semibold uppercase block mb-1">
                            {student?.dropout?.status === "Dropout" ? (
                              <>
                                Dropout Date : {student?.dropout?.dropoutDate}
                              </>
                            ) : (
                              <>
                                Interrupted Date :{" "}
                                {student?.dropout?.dropoutDate}
                              </>
                            )}
                          </span>
                        </div>

                        <span className="text-[10px] text-destructive font-semibold uppercase block mb-1">
                          Reason
                        </span>
                        <p className="text-sm text-foreground font-medium leading-snug wrap-break-word">
                          {student?.dropout?.reason || "No reason specified"}
                        </p>
                      </div>

                      {student?.dropout?.remark && (
                        <div className="mt-3 bg-background/50 p-4 mx-4 rounded-lg border border-border/50">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">
                            Remark
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed wrap-break-word whitespace-pre-wrap">
                            {student?.dropout.remark}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {student?.previousEnrollments &&
                student?.previousEnrollments?.length > 0 && (
                  <section className="py-4 rounded-xl">
                    <h3 className="text-xs font-black text-primary/40 uppercase tracking-[0.2em] flex items-center gap-2 mb-5">
                      <School className="h-4 w-4" /> Interrput History
                    </h3>

                    <div className="flex flex-col gap-5">
                      {student?.previousEnrollments &&
                        student?.previousEnrollments?.length > 0 &&
                        student.previousEnrollments.map((s, index) => (
                          <div
                            className=" grid gap-4 bg-muted/30 rounded-xl py-2 border border-border border-dashed"
                            key={index}
                          >
                            <div className="relative border-l-2 border-destructive/20 py-1">
                              <div className="mb-2 px-4">
                                <div className="grid grid-cols-2 mb-2 gap-y-2">
                                  <span className="text-[12px] font-semibold uppercase block mb-1 col-span-2">
                                    Intake : {s?.dropout.intakeCode || "N/A"}
                                  </span>
                                  <span className="text-[12px] font-semibold uppercase block mb-1 flex-1">
                                    Enrolled Date : {s?.dropout?.enrolledDate}
                                  </span>
                                  <span className="text-[12px] font-semibold uppercase block mb-1 flex-1">
                                    {s?.dropout?.status === "Dropout" ? (
                                      <>
                                        Dropout Date : {s?.dropout?.dropoutDate}
                                      </>
                                    ) : (
                                      <>
                                        Interrupted Date :{" "}
                                        {s?.dropout?.dropoutDate}
                                      </>
                                    )}
                                  </span>
                                </div>

                                <span className="text-[10px] text-destructive font-semibold uppercase block mb-1">
                                  Reason
                                </span>
                                <p className="text-sm text-foreground font-medium leading-snug wrap-break-word">
                                  {s?.dropout?.reason || "No reason specified"}
                                </p>
                              </div>

                              {s?.dropout?.remark && (
                                <div className="mt-3 bg-background/50 p-4 mx-4 rounded-lg border border-border/50">
                                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">
                                    Remark
                                  </span>
                                  <p className="text-xs text-muted-foreground leading-relaxed wrap-break-word whitespace-pre-wrap">
                                    {s?.dropout.remark}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                )}
            </div>

            {/* Sidebar Stats - 4 Units */}
            <div className="lg:col-span-4 bg-muted/30 border-l border-border/50 p-6 sm:p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Enrollment Details
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="p-3 bg-background rounded-lg border shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Intake
                    </p>
                    <p className="text-sm font-bold">
                      {student.intakeCode + " - " + student.majorName}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Semester
                    </p>

                    <p className="text-sm font-bold">{student.currentStatus}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Compliance Checklist
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "NRC Copy", status: student.nrcCopy },
                    { label: "Census Copy", status: student.censusCopy },
                    { label: "Passport Photo", status: student.passportPhoto },
                    {
                      label: "Education Cert",
                      status: student.educationCertificate,
                    },
                  ].map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs font-medium p-2 bg-background rounded-md border border-transparent hover:border-border transition-all"
                    >
                      <span>{doc.label}</span>
                      {doc.status ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive/40" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              {currentRole === "admin" && (
                <div className="pt-6 space-y-3">
                  {student.status !== "Dropout" &&
                    student.status !== "Enrolled" && (
                      <>
                        <ReactivateModal
                          onReactivate={onReactivate}
                          credential={{
                            studentId: student.studentId as string,
                            scholar: student.scholar,
                            registrationFee: student.registrationFee,
                            firstInstallmentFee: student.firstInstallmentFee,
                            nrcCopy: student.nrcCopy,
                            censusCopy: student.censusCopy,
                            passportPhoto: student.passportPhoto,
                            educationCertificate: student.educationCertificate,
                          }}
                          intakes={intakes}
                        />
                      </>
                    )}
                  {student.status !== "Dropout" &&
                    student.status !== "Interrupted" && (
                      <>
                        <DropoutModal
                          type="Interrupted"
                          onDropout={onDropout}
                          enrollmentId={student.id}
                        />
                        <DropoutModal
                          type="Dropout"
                          onDropout={onDropout}
                          enrollmentId={student.id}
                        />
                      </>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
