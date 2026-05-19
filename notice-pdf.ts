import PDFDocument from "pdfkit";
import * as fs from "fs";

/**
 * Interfaces for Type Safety
 */
interface StudentResult {
  rollNo: number;
  studentId: string;
  name: string;
  distinctions: string[];
}

interface MajorGroup {
  majorName: string;
  students: StudentResult[];
}

interface SubjectRemark {
  code: string;
  name: string;
}

interface ExamResultData {
  collegeName: string;
  campus: string;
  faculty: string;
  degree: string;
  intake: string;
  academicYear: string;
  announcementDate: string;
  results: MajorGroup[];
  remarks: SubjectRemark[];
  signatoryName: string;
  signatoryTitle: string;
  signatoryOrganization: string;
}

/**
 * Function to generate the Exam Result PDF
 */
async function generateExamResultPDF(
  data: ExamResultData,
  outputPath: string,
): Promise<void> {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // --- Header Section ---
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`${data.collegeName} (${data.campus})`, { align: "center" });
  doc.fontSize(12).font("Helvetica").text(data.faculty, { align: "center" });
  doc.text(data.degree, { align: "center" });
  doc.moveDown();

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Announcement for Exam Result", { align: "center", underline: true });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`${data.intake} (${data.academicYear})`, { align: "center" });
  doc.text(data.announcementDate, { align: "center" });
  doc.moveDown();

  doc
    .fontSize(10)
    .text(
      `This is to announce that the following students have PASSED the examination of ${data.degree} First Year for Academic Year (${data.academicYear}).`,
      { align: "left" },
    );
  doc
    .font("Helvetica-Oblique")
    .text(
      "(NOTE: This exam result is prepared in the order of highest marks first.)",
    );
  doc.moveDown();

  // --- Tables for Each Major ---
  data.results.forEach((group) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(group.majorName, { underline: true });
    doc.moveDown(0.5);

    // Table Header
    const startX = 50;
    const colWidths = [40, 100, 150, 200];
    let currentY = doc.y;

    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("Roll No", startX, currentY, { width: colWidths[0] });
    doc.text("Student ID", startX + colWidths[0], currentY, {
      width: colWidths[1],
    });
    doc.text("Name", startX + colWidths[0] + colWidths[1], currentY, {
      width: colWidths[2],
    });
    doc.text(
      "Distinction(s)",
      startX + colWidths[0] + colWidths[1] + colWidths[2],
      currentY,
      { width: colWidths[3] },
    );

    doc
      .moveTo(startX, currentY + 12)
      .lineTo(startX + 500, currentY + 12)
      .stroke();
    doc.moveDown();
    currentY = doc.y + 5;

    // Table Rows
    doc.font("Helvetica").fontSize(9);
    group.students.forEach((student) => {
      const distinctionsStr = student.distinctions.join(", ");
      const rowHeight = Math.max(
        15,
        doc.heightOfString(distinctionsStr, { width: colWidths[3] }),
      );

      doc.text(student.rollNo.toString(), startX, currentY);
      doc.text(student.studentId, startX + colWidths[0], currentY);
      doc.text(student.name, startX + colWidths[0] + colWidths[1], currentY);
      doc.text(
        distinctionsStr,
        startX + colWidths[0] + colWidths[1] + colWidths[2],
        currentY,
        { width: colWidths[3] },
      );

      currentY += rowHeight + 5;

      // Check for page break
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });

    doc.moveDown(2);
  });

  // --- Footer / Remarks ---
  doc.addPage(); // As per source 42
  doc.font("Helvetica-Bold").fontSize(10).text("Remark:");

  // Split remarks into two columns for better layout
  const midPoint = Math.ceil(data.remarks.length / 2);
  const leftCol = data.remarks.slice(0, midPoint);
  const rightCol = data.remarks.slice(midPoint);

  let remarkY = doc.y + 10;
  leftCol.forEach((item, i) => {
    doc.text(`${item.code}`, 50, remarkY + i * 15, { width: 60 });
    doc.font("Helvetica").text(`${item.name}`, 110, remarkY + i * 15);
    doc.font("Helvetica-Bold");
  });

  rightCol.forEach((item, i) => {
    doc.text(`${item.code}`, 300, remarkY + i * 15, { width: 60 });
    doc.font("Helvetica").text(`${item.name}`, 360, remarkY + i * 15);
    doc.font("Helvetica-Bold");
  });

  // --- Signature Section ---
  const bottomY = 700;
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(data.signatoryName, 400, bottomY);
  doc.font("Helvetica").text(data.signatoryTitle, 400, bottomY + 15);
  doc.text(data.announcementDate, 400, bottomY + 30);
  doc.text(data.signatoryOrganization, 400, bottomY + 45);

  doc.end();
}

/**
 * Mock Data based on provided document [cite: 1, 5, 10, 12, 15-41]
 */
const mockData: ExamResultData = {
  collegeName: "STI Myanmar College",
  campus: "Mandalay Campus",
  faculty: "Faculty of Engineering and Technology",
  degree: "BEng (Hons) Engineering",
  intake: "Intake 17 - First Year",
  academicYear: "August 2025 - April 2026",
  announcementDate: "24th April 2026",
  results: [
    {
      majorName: "Civil Engineering",
      students: [
        {
          rollNo: 1,
          studentId: "STIMDY-272",
          name: "Thwin Khant Zaw",
          distinctions: [
            "BE 2101",
            "BE 2102",
            "BE 2103",
            "BE 2104",
            "BE 2105",
            "BE 2106",
          ],
        },
        {
          rollNo: 2,
          studentId: "STIMDY-274",
          name: "Min Khant Ko Ko",
          distinctions: ["BE 2102", "BE 2103", "BE 2104", "BE 2106"],
        },
      ],
    },
    {
      majorName: "Architectural Engineering",
      students: [
        {
          rollNo: 1,
          studentId: "STIMDY-276",
          name: "Thet Win Htet",
          distinctions: [
            "BE 2101",
            "BE 2102",
            "BE 2104",
            "BE 2106",
            "BE 2110",
            "BE 2118",
            "BE 2117",
          ],
        },
      ],
    },
  ],
  remarks: [
    { code: "BE 2101", name: "Mathematics II" },
    { code: "BE 2102", name: "Graphical Process for Design" },
    { code: "BE 2103", name: "Applied Mechanics" },
    { code: "BE 2104", name: "Surveying" },
    { code: "BE 2105", name: "Mechanics of Materials" },
    { code: "BE 2106", name: "Sustainable Design" },
    { code: "BE 2107", name: "Construction Materials" },
    { code: "BE 2108", name: "Construction Plant in Civil" },
    { code: "BE 2110", name: "Construction" },
    { code: "BE 2117", name: "Introduction to Architecture" },
    { code: "BE 2118", name: "Applied & Material Mechanics" },
    { code: "BE 210E", name: "English" },
  ],
  signatoryName: "Daw Thet Mon Htoo",
  signatoryTitle: "Registrar / Head of Training",
  signatoryOrganization: "STI Myanmar College",
};

// Execution
generateExamResultPDF(mockData, "Exam_Result_Notice.pdf");
