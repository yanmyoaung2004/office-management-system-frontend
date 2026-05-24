import ExcelJS from "exceljs";

export interface ProgressCourse {
  name: string;
  code: string;
}

export interface ProgressStudent {
  id: string;
  name: string;
  scores: number[];
}

export interface ProgressResultConfig {
  campus: string;
  program: string;
  intake: string;
  courses: ProgressCourse[];
  students: ProgressStudent[];
}

function colNumToLetter(col: number): string {
  let result = "";
  let temp = col;
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    temp = Math.floor((temp - 1) / 26);
  }
  return result;
}

const thinBorder = {
  top: { style: "thin" as const },
  left: { style: "thin" as const },
  bottom: { style: "thin" as const },
  right: { style: "thin" as const },
};

const centerAlign = {
  horizontal: "center" as const,
  vertical: "middle" as const,
};

const FONT_NAME = "Arial";

function font(overrides?: {
  bold?: boolean;
  size?: number;
}): Partial<ExcelJS.Font> {
  return { name: FONT_NAME, ...overrides };
}

export async function generateProgressResultBuffer(
  config: ProgressResultConfig,
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Progress MDY (civil)");

  const numCourses = config.courses.length;
  const totalMarksCol = 4 + numCourses;
  const averageCol = totalMarksCol + 1;
  const remarkCol = averageCol + 1;

  // ================== HEADER ROWS 1-4 (no border) ==================
  const rowHeight = 35;
  const headerInfo = [
    { value: config.campus, size: 16 },
    { value: config.program, size: 14 },
    { value: config.intake, size: 14 },
    { value: "Progress Result", size: 14 },
  ];

  for (let r = 0; r < 4; r++) {
    const rowNum = r + 1;
    worksheet.getRow(rowNum).height = rowHeight;
    worksheet.mergeCells(rowNum, 1, rowNum, remarkCol);

    const cell = worksheet.getCell(rowNum, 1);
    cell.value = headerInfo[r].value;
    cell.font = font({ bold: true, size: headerInfo[r].size });
    cell.alignment = centerAlign;
  }

  // Row 5 (empty spacer, no border)
  worksheet.getRow(5).height = rowHeight;
  worksheet.mergeCells(5, 1, 5, remarkCol);

  // ================== TABLE HEADER (ROW 6) — 100px ==================
  worksheet.getRow(6).height = 80;

  const tableHeaders: { col: number; value: string }[] = [
    { col: 1, value: "No" },
    { col: 2, value: "Student \nID" },
    { col: 3, value: "Name" },
    ...config.courses.map((c, i) => ({
      col: 4 + i,
      value: `${c.name}\n(${c.code})`,
    })),
    { col: totalMarksCol, value: "Total Marks" },
    { col: averageCol, value: "Average of First Semester" },
    { col: remarkCol, value: "Remark" },
  ];

  for (const h of tableHeaders) {
    const cell = worksheet.getCell(6, h.col);
    cell.value = h.value;
    cell.font = font({ bold: true, size: 11 });
    cell.alignment = { ...centerAlign, wrapText: true };
    cell.border = thinBorder;
  }

  // ================== STUDENT DATA (ROW 7+) ==================
  const firstScoreColLetter = colNumToLetter(4);
  const lastScoreColLetter = colNumToLetter(4 + numCourses - 1);

  for (let i = 0; i < config.students.length; i++) {
    const rowNum = 7 + i;
    const student = config.students[i];
    worksheet.getRow(rowNum).height = rowHeight;

    const setCell = (col: number, val: ExcelJS.CellValue) => {
      const cell = worksheet.getCell(rowNum, col);
      cell.value = val;
      cell.font = font({ size: 12 });
      cell.alignment = centerAlign;
      cell.border = thinBorder;
    };

    setCell(1, i + 1);
    setCell(2, student.id);
    setCell(3, student.name);

    for (let s = 0; s < numCourses; s++) {
      setCell(4 + s, student.scores[s] ?? 0);
    }

    const cellTotal = worksheet.getCell(rowNum, totalMarksCol);
    cellTotal.value = {
      formula: `SUM(${firstScoreColLetter}${rowNum}:${lastScoreColLetter}${rowNum})`,
    };
    cellTotal.font = font({ size: 12 });
    cellTotal.alignment = centerAlign;
    cellTotal.border = thinBorder;

    const cellAvg = worksheet.getCell(rowNum, averageCol);
    cellAvg.value = {
      formula: `AVERAGE(${firstScoreColLetter}${rowNum}:${lastScoreColLetter}${rowNum})`,
    };
    cellAvg.font = font({ size: 12 });
    cellAvg.alignment = centerAlign;
    cellAvg.border = thinBorder;

    const cellRemark = worksheet.getCell(rowNum, remarkCol);
    cellRemark.value = "";
    cellRemark.font = font({ size: 12 });
    cellRemark.alignment = centerAlign;
    cellRemark.border = thinBorder;
  }

  // ================== AUTO FILTER (marks columns only) ==================
  if (config.students.length > 0) {
    const filterStartRow = 6;
    const filterEndRow = 6 + config.students.length;
    // const filterStartCol = colNumToLetter(4);
    // const filterEndCol = colNumToLetter(remarkCol);
    worksheet.autoFilter = {
      from: { row: filterStartRow, column: 4 },
      to: { row: filterEndRow, column: remarkCol },
    };
  }

  // ================== COLUMN WIDTHS ==================
  worksheet.getColumn(1).width = 6.86;
  worksheet.getColumn(2).width = 20.43;
  worksheet.getColumn(3).width = 24.29;
  for (let c = 4; c <= remarkCol; c++) {
    worksheet.getColumn(c).width = 15.29;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

export async function generateAndDownloadProgressResultExcel(
  config: ProgressResultConfig,
  filename = "Progress_Result.xlsx",
): Promise<void> {
  const buffer = await generateProgressResultBuffer(config);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
