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
  Footer,
  SimpleField,
} from "docx";

// ===========================
// DATA INTERFACES
// ===========================
export interface ProgressStudent {
  student_id: string;
  name: string;
  resubmit_modules: string[];
  resit_modules: string[];
}

export interface ProgressDepartment {
  name: string;
  students: ProgressStudent[];
}

export interface ProgressReportData {
  college_name: string;
  faculty: string;
  program: string;
  intake: string;
  date: string;
  departments: ProgressDepartment[];
  remark_subjects: string[];
  signatory_name: string;
  signatory_title: string;
  signatory_date: string;
  signatory_college: string;
}

// ===========================
// STYLE CONSTANTS
// ===========================
const FONT = "Arial";

const border = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "000000",
};

const cellBorders = {
  top: border,
  bottom: border,
  left: border,
  right: border,
};

// ===========================
// HELPERS
// ===========================
function p(
  text: string,
  opts?: {
    bold?: boolean;
    size?: number;
    alignment?: "start" | "center" | "end" | "both" | "left" | "right";
    italics?: boolean;
    underline?: boolean;
    spacingAfter?: number;
  },
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: FONT,
        bold: opts?.bold ?? false,
        size: opts?.size ?? 20,
        italics: opts?.italics ?? false,
        underline: opts?.underline ? { type: "single" } : undefined,
      }),
    ],
    alignment: opts?.alignment ?? "left",
    spacing: opts?.spacingAfter !== undefined ? { after: opts.spacingAfter } : undefined,
  });
}

function headerCell(text: string, widthPct: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            font: FONT,
            size: 20,
          }),
        ],
        alignment: "center",
      }),
    ],
    width: { size: widthPct * 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    verticalAlign: "center",
  });
}

function multiLineHeaderCell(
  lines: string[],
  widthPct: number,
): TableCell {
  return new TableCell({
    children: lines.map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({ text: line, bold: true, font: FONT, size: 20 }),
          ],
          alignment: "center",
        }),
    ),
    width: { size: widthPct * 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    verticalAlign: "center",
  });
}

function dataCell(
  text: string,
  widthPct: number,
  alignment: "start" | "center" | "end" | "both" | "left" | "right" = "center",
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, font: FONT, size: 20 })],
        alignment,
      }),
    ],
    width: { size: widthPct * 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    verticalAlign: "center",
  });
}

function createTableHeaderRow(): TableRow {
  return new TableRow({
    tableHeader: true,
    children: [
      headerCell("No", 0.05),
      headerCell("Student ID", 0.18),
      headerCell("Name", 0.27),
      multiLineHeaderCell(
        ["Re-submit Assessment/", "Presentation Module (s)"],
        0.30,
      ),
      multiLineHeaderCell(["Re-sit", "Module(s)"], 0.20),
    ],
  });
}

function createStudentRow(
  student: ProgressStudent,
  index: number,
): TableRow {
  const resubmit =
    student.resubmit_modules.length > 0
      ? student.resubmit_modules.join(", ")
      : "-";
  const resit =
    student.resit_modules.length > 0
      ? student.resit_modules.join(", ")
      : "-";

  return new TableRow({
    children: [
      dataCell(String(index + 1), 0.05),
      dataCell(student.student_id, 0.18),
      dataCell(student.name, 0.27, "left"),
      dataCell(resubmit, 0.30),
      dataCell(resit, 0.20),
    ],
  });
}

// ===========================
// DOCUMENT GENERATION
// ===========================
export function generateProgressResultDoc(
  data: ProgressReportData,
): Document {
  const children: (Paragraph | Table)[] = [];

  // ===== HEADER SECTION =====
  children.push(
    p(data.college_name, {
      bold: true,
      size: 28,
      alignment: "center",
      spacingAfter: 0,
    }),
    p(data.faculty, {
      bold: true,
      size: 24,
      alignment: "center",
      spacingAfter: 0,
    }),
    p(data.program, {
      bold: true,
      size: 24,
      alignment: "center",
      spacingAfter: 200,
    }),
    p("Progress Result", {
      bold: true,
      size: 28,
      underline: true,
      alignment: "center",
      spacingAfter: 0,
    }),
    p(data.intake, {
      bold: true,
      size: 24,
      alignment: "center",
      spacingAfter: 0,
    }),
    p(data.date, {
      size: 24,
      alignment: "center",
      spacingAfter: 300,
    }),
  );

  // ===== BODY =====
  children.push(
    p("The following students are qualified to attend the 2nd Semester.", {
      size: 20,
      spacingAfter: 0,
    }),
    p(
      "(NOTE : This exam result is prepared in the order of highest marks first.)",
      { italics: true, size: 20, spacingAfter: 300 },
    ),
  );

  // ===== DEPARTMENT TABLES =====
  data.departments.forEach((dept) => {
    children.push(
      p(dept.name, {
        bold: true,
        size: 20,
        spacingAfter: 200,
      }),
    );

    const rows: TableRow[] = [createTableHeaderRow()];
    dept.students.forEach((student, idx) => {
      rows.push(createStudentRow(student, idx));
    });

    children.push(
      new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      new Paragraph({ spacing: { after: 200 } }),
    );
  });

  // ===== REMARK SECTION =====
  children.push(
    p("Remark", {
      bold: true,
      underline: true,
      size: 20,
      spacingAfter: 200,
    }),
  );

  data.remark_subjects.forEach((subject) => {
    children.push(p(subject, { size: 20, spacingAfter: 0 }));
  });

  // Spacer before signatory
  children.push(
    new Paragraph({ spacing: { after: 400 } }),
    new Paragraph({ spacing: { after: 400 } }),
  );

  // ===== SIGNATORY =====
  children.push(
    p(data.signatory_name, {
      size: 20,
      alignment: "right",
      spacingAfter: 0,
    }),
    p(data.signatory_date, {
      size: 20,
      alignment: "right",
      spacingAfter: 0,
    }),
    p(data.signatory_title, {
      size: 20,
      alignment: "right",
      spacingAfter: 0,
    }),
    p(data.signatory_college, {
      size: 20,
      alignment: "right",
      spacingAfter: 0,
    }),
  );

  // ===== SECTION PROPERTIES =====
  const sectionProperties = {
    page: {
      size: {
        width: 11906, // A4 in twips (595.4pt * 20)
        height: 16838, // A4 in twips (841.7pt * 20)
      },
      margin: {
        top: 1440, // 1 inch
        bottom: 1440,
        left: 1440,
        right: 1440,
      },
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Page ", font: FONT, size: 20 }),
              new SimpleField(" PAGE "),
              new TextRun({ text: " of ", font: FONT, size: 20 }),
              new SimpleField(" NUMPAGES "),
            ],
            alignment: "center",
          }),
        ],
      }),
    },
  };

  return new Document({
    sections: [
      {
        properties: sectionProperties,
        children,
      },
    ],
  });
}

// ===========================
// BROWSER DOWNLOAD
// ===========================
export async function generateProgressResultBuffer(
  data: ProgressReportData,
): Promise<ArrayBuffer> {
  const doc = generateProgressResultDoc(data);
  const buffer = await Packer.toBuffer(doc);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export async function generateAndDownloadProgressResult(
  data: ProgressReportData,
  filename = "Progress_Result.docx",
): Promise<void> {
  const buffer = await generateProgressResultBuffer(data);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
