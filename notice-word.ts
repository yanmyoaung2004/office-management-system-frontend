import {
  generateAndDownloadProgressResult,
  ProgressDepartment,
  ProgressReportData,
} from "./lib/DocumentGenerator";

const reportData: ProgressReportData = {
  college_name: "STI Myanmar College (Mandalay Campus)",
  faculty: "Faculty of Engineering and Technology",
  program: "BEng (Hons) Engineering",
  intake: "Intake 19 - First Year (1st Semester)",
  date: "24th April 2026",
  departments: [
    {
      name: "Civil Engineering",
      students: [
        { student_id: "STIMDY-300", name: "Htet Htet Naing", resubmit_modules: [], resit_modules: [] },
        { student_id: "STIMDY-308", name: "Phyu Lwin Thant", resubmit_modules: [], resit_modules: [] },
        { student_id: "STIMDY-301", name: "Ei Nadi Oo", resubmit_modules: [], resit_modules: [] },
      ],
    },
    {
      name: "Architectural Engineering",
      students: [
        { student_id: "STIMDY-311", name: "Thu Ta Aung", resubmit_modules: [], resit_modules: [] },
      ],
    },
  ],
  remark_subjects: [
    "BE 2101- Mathematics II",
    "BE 2102- Graphical Process for Design",
    "BE 2103- Applied Mechanics",
    "BE 2118- Applied & Materials Mechanics",
    "BE 2107- Construction Materials",
    "BE 2109- Organization and Procedure Construction",
    "BE 210E- English",
  ],
  signatory_name: "Daw Myat Noe Oo",
  signatory_title: "(သင်တန်းမှူး)",
  signatory_date: "24th Apr 2026",
  signatory_college: "STI Myanmar College",
};

generateAndDownloadProgressResult(reportData, "Progress_Result.docx")
  .then(() => console.log("Process complete."))
  .catch((error: Error) => console.error("Execution failed:", error.message));
