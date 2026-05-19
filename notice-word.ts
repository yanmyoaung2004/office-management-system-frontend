import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  UnderlineType,
} from "docx";

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

async function generateExamResultDocx(
  data: ExamResultData,
  outputPath: string,
): Promise<void> {
  const sections = [];

  // --- Header Section ---
  const header = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${data.collegeName} (${data.campus})`,
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.faculty, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.degree, size: 24 })],
    }),
    new Paragraph({ spacing: { before: 200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Announcement for Exam Result",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${data.intake} (${data.academicYear})`,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.announcementDate, size: 20 })],
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: `This is to announce that the following students have PASSED the examination of ${data.degree} First Year for Academic Year (${data.academicYear}).`,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "(NOTE: This exam result is prepared in the order of highest marks first.)",
          italics: true,
          size: 20,
        }),
      ],
    }),
  ];

  // --- Tables for Each Major ---
  const body: (Paragraph | Table)[] = [];

  data.results.forEach((group) => {
    body.push(
      new Paragraph({
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: group.majorName,
            bold: true,
            underline: {},
            size: 22,
          }),
        ],
      }),
    );

    const rows = [
      // Table Header
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Roll No", bold: true })],
              }),
            ],
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Student ID", bold: true })],
              }),
            ],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Name", bold: true })],
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Distinction(s)", bold: true })],
              }),
            ],
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      // Data Rows
      ...group.students.map(
        (s) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(s.rollNo.toString())] }),
              new TableCell({ children: [new Paragraph(s.studentId)] }),
              new TableCell({ children: [new Paragraph(s.name)] }),
              new TableCell({
                children: [new Paragraph(s.distinctions.join(", "))],
              }),
            ],
          }),
      ),
    ];

    body.push(
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
    );
  });

  // --- Remark & Signature (Simplified layout for Word) ---
  const footer = [
    new Paragraph({
      spacing: { before: 400 },
      children: [new TextRun({ text: "Remark:", bold: true })],
    }),
    ...data.remarks.map(
      (r) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${r.code}: `, bold: true }),
            new TextRun(r.name),
          ],
        }),
    ),
    new Paragraph({ spacing: { before: 800 } }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: data.signatoryName, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun(data.signatoryTitle)],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun(data.announcementDate)],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun(data.signatoryOrganization)],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [...header, ...body, ...footer],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
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
generateExamResultDocx(mockData, "Exam_Result_Notice.docx");
