import ExcelJS from "exceljs";

interface Subject {
  name: string;
  code: string;
}

interface StudentData {
  no: number;
  rollNo: number;
  studentId: string;
  name: string;
  s1Marks: number[] | Record<string, number>;
  s2Marks: number[] | Record<string, number>;
}

interface GenerateConfig {
  sheetName?: string;
  collegeName?: string;
  programName?: string;
  intake?: string;
  s1Subjects?: Subject[];
  s2Subjects?: Subject[];
  students?: StudentData[];
}

function normalizeMarks(
  marks: number[] | Record<string, number>,
  subjects: Subject[],
): number[] {
  if (Array.isArray(marks)) return marks;
  return subjects.map((subj) => marks[subj.code] ?? 0);
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

function getCellRef(row: number, col: number): string {
  return `${colNumToLetter(col)}${row}`;
}

function colLetterToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result;
}

async function generateResultExcel(
  config: GenerateConfig,
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();

  const {
    sheetName = "Student Result",
    collegeName = "STI Myanmar University",
    programName = "Program",
    intake = "Intake",
    s1Subjects = [],
    s2Subjects = [],
    students = [],
  } = config;

  const worksheet = workbook.addWorksheet(sheetName);

  const normalizedStudents = students.map((s) => ({
    ...s,
    s1Marks: normalizeMarks(s.s1Marks, s1Subjects),
    s2Marks: normalizeMarks(s.s2Marks, s2Subjects),
  }));

  const s1Count = s1Subjects.length;
  const s2Count = s2Subjects.length;
  const totalSubjects = s1Count + s2Count;

  // Column layout (1-indexed column numbers)
  const SUBJECT_COLS = 4; // CU, Marks, G, GP per subject

  const s1Start = 5;
  const s2Start = s1Start + s1Count * SUBJECT_COLS;
  const s1TotalStart = s2Start + s2Count * SUBJECT_COLS;
  const s2TotalStart = s1TotalStart + 3;
  const gpaStart = s2TotalStart + 3;
  const semRemarkStart = gpaStart + 2;
  const totalS1S2Start = semRemarkStart + 2;
  const cummGpaStart = totalS1S2Start + 3;
  const avgMarkStart = cummGpaStart + 1;
  const finalRemarkStart = avgMarkStart + 1;
  const finalGradeStart = finalRemarkStart + 1;
  const resitStart = finalGradeStart + 1;
  const lastCol = resitStart + s1Count + s2Count - 1;

  // Build column widths — 45px for all, 190px for C and D
  const colWidths: Record<number, number> = {};
  for (let i = 1; i <= lastCol; i++) {
    colWidths[i] = 7.0;
  }
  colWidths[3] = 28.0; // C
  colWidths[4] = 28.0; // D

  Object.entries(colWidths).forEach(([col, width]) => {
    worksheet.getColumn(Number(col)).width = width;
  });

  // Row heights — 75px for all, 36px for rows 4-5
  function pxToPt(px: number): number {
    return Math.round((px * 72) / 96);
  }
  const H75 = pxToPt(75);
  const H36 = pxToPt(36);
  for (let i = 1; i <= 3; i++) {
    worksheet.getRow(i).height = H75;
  }
  worksheet.getRow(4).height = H36;
  worksheet.getRow(5).height = H36;
  worksheet.getRow(6).height = H75;
  worksheet.getRow(7).height = H75;

  const thinBorder = {
    top: { style: "thin" as const },
    left: { style: "thin" as const },
    bottom: { style: "thin" as const },
    right: { style: "thin" as const },
  };

  const headerStyle = {
    font: { name: "Arial", size: 10, bold: true },
    alignment: {
      horizontal: "center" as const,
      vertical: "middle" as const,
      wrapText: true,
    },
    border: thinBorder,
  };

  const dataRowStyle = {
    font: { name: "Arial", size: 10 },
    alignment: { horizontal: "center" as const, vertical: "middle" as const },
    border: thinBorder,
  };

  const dataBoldStyle = {
    ...dataRowStyle,
    font: { name: "Arial", size: 10, bold: true },
  };

  // ===========================
  // HEADER SECTION (Rows 1-3)
  // ===========================

  const collegeCellRef = getCellRef(1, s2Start);
  worksheet.getCell(collegeCellRef).value = collegeName;
  worksheet.getCell(collegeCellRef).font = {
    name: "Arial",
    size: 18,
    bold: true,
  };
  worksheet.getCell(collegeCellRef).alignment = { vertical: "middle" };
  // worksheet.getCell(collegeCellRef).border = thinBorder;

  const programCellRef = getCellRef(2, s2Start + 1);
  worksheet.getCell(programCellRef).value = programName;
  worksheet.getCell(programCellRef).font = {
    name: "Arial",
    size: 16,
    bold: true,
  };
  worksheet.getCell(programCellRef).alignment = { vertical: "middle" };
  // worksheet.getCell(programCellRef).border = thinBorder;

  const intakeCellRef = getCellRef(3, s2Start - 1);
  worksheet.getCell(intakeCellRef).value = intake;
  worksheet.getCell(intakeCellRef).font = {
    name: "Arial",
    size: 16,
    bold: true,
  };
  worksheet.getCell(intakeCellRef).alignment = { vertical: "middle" };
  // worksheet.getCell(intakeCellRef).border = thinBorder;

  // ===========================
  // TABLE HEADERS (Rows 5-7)
  // ===========================
  const setCell = (
    row: number,
    col: number,
    value: string | number,
    style: Record<string, unknown>,
  ) => {
    const cell = worksheet.getCell(getCellRef(row, col));
    cell.value = value;
    Object.assign(cell, style);
  };

  // Basic info headers
  setCell(5, 1, "No", headerStyle);
  setCell(5, 2, "Roll No", headerStyle);
  setCell(5, 3, "Student ID", headerStyle);
  setCell(5, 4, "Name\n(English)", headerStyle);

  worksheet.mergeCells(5, 1, 7, 1);
  worksheet.mergeCells(5, 2, 7, 2);
  worksheet.mergeCells(5, 3, 7, 3);
  worksheet.mergeCells(5, 4, 7, 4);

  // S1 Header
  const s1End = s1Start + s1Count * SUBJECT_COLS - 1;
  setCell(5, s1Start, "S1", headerStyle);
  worksheet.mergeCells(5, s1Start, 5, s1End);

  // S1 subjects
  s1Subjects.forEach((subject, idx) => {
    const subjCol = s1Start + idx * SUBJECT_COLS;
    setCell(6, subjCol, `${subject.name}\n(${subject.code})`, headerStyle);
    worksheet.mergeCells(6, subjCol, 6, subjCol + 3);
    setCell(7, subjCol, "CU", headerStyle);
    setCell(7, subjCol + 1, "Marks", headerStyle);
    setCell(7, subjCol + 2, "G", headerStyle);
    setCell(7, subjCol + 3, "G.P", headerStyle);
  });

  // S2 Header
  const s2End = s2Start + s2Count * SUBJECT_COLS - 1;
  if (s2Count > 0) {
    setCell(5, s2Start, "S2", headerStyle);
    worksheet.mergeCells(5, s2Start, 5, s2End);
  }

  // S2 subjects
  s2Subjects.forEach((subject, idx) => {
    const subjCol = s2Start + idx * SUBJECT_COLS;
    setCell(6, subjCol, `${subject.name}\n(${subject.code})`, headerStyle);
    worksheet.mergeCells(6, subjCol, 6, subjCol + 3);

    setCell(7, subjCol, "CU", headerStyle);
    setCell(7, subjCol + 1, "Marks", headerStyle);
    setCell(7, subjCol + 2, "G", headerStyle);
    setCell(7, subjCol + 3, "G.P", headerStyle);
  });

  // S1 Total
  if (s1Count > 0) {
    setCell(5, s1TotalStart, "S1 Total", headerStyle);
    worksheet.mergeCells(5, s1TotalStart, 6, s1TotalStart + 2);
    setCell(7, s1TotalStart, "S1 CU", headerStyle);
    setCell(7, s1TotalStart + 1, "S1 Marks", headerStyle);
    setCell(7, s1TotalStart + 2, "S1 \nG.P", headerStyle);
  }

  // S2 Total
  if (s2Count > 0) {
    setCell(5, s2TotalStart, "S2 Total", headerStyle);
    worksheet.mergeCells(5, s2TotalStart, 6, s2TotalStart + 2);
    setCell(7, s2TotalStart, "S2 CU", headerStyle);
    setCell(7, s2TotalStart + 1, "S2 Marks", headerStyle);
    setCell(7, s2TotalStart + 2, "S2 \nG.P", headerStyle);
  }

  // G.P.A
  setCell(5, gpaStart, "G.P.A", headerStyle);
  worksheet.mergeCells(5, gpaStart, 6, gpaStart + 1);
  setCell(7, gpaStart, "S1", headerStyle);
  setCell(7, gpaStart + 1, "S2", headerStyle);

  // Semester Wise Remark
  setCell(5, semRemarkStart, "Semester Wise Remark", headerStyle);
  worksheet.mergeCells(5, semRemarkStart, 6, semRemarkStart + 1);
  setCell(7, semRemarkStart, "S1", headerStyle);
  setCell(7, semRemarkStart + 1, "S2", headerStyle);

  // Total (S1+S2)
  setCell(5, totalS1S2Start, "Total (S1+S2)", headerStyle);
  worksheet.mergeCells(5, totalS1S2Start, 6, totalS1S2Start + 2);
  setCell(7, totalS1S2Start, "CU", headerStyle);
  setCell(7, totalS1S2Start + 1, "Marks", headerStyle);
  setCell(7, totalS1S2Start + 2, "GP", headerStyle);

  const yellowFill = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FFFFFF00" },
  };

  // Cumm: G.P.A
  setCell(5, cummGpaStart, "Cumm:\nG.P.A", {
    ...headerStyle,
    fill: yellowFill,
  });
  worksheet.mergeCells(5, cummGpaStart, 7, cummGpaStart);

  // Average Total Mark
  setCell(5, avgMarkStart, "Average Total Mark", {
    ...headerStyle,
    fill: yellowFill,
  });
  worksheet.mergeCells(5, avgMarkStart, 7, avgMarkStart);

  // Final Remark
  setCell(5, finalRemarkStart, "Final Remark", headerStyle);
  worksheet.mergeCells(5, finalRemarkStart, 7, finalRemarkStart);

  // Final Grade
  setCell(5, finalGradeStart, "Final Grade (New calculation)", {
    ...headerStyle,
    fill: yellowFill,
  });
  worksheet.mergeCells(5, finalGradeStart, 7, finalGradeStart);

  // Resit Module
  const resitS1End = resitStart + s1Count - 1;
  const resitEnd = resitStart + s1Count + s2Count - 1;

  if (s1Count > 0 || s2Count > 0) {
    setCell(5, resitStart, "Resit Module", headerStyle);
    worksheet.mergeCells(5, resitStart, 6, resitEnd);
  }
  if (s1Count > 0) {
    setCell(7, resitStart, "S1", headerStyle);
    worksheet.mergeCells(7, resitStart, 7, resitS1End);
    s1Subjects.forEach((subject, idx) => {
      setCell(8, resitStart + idx, subject.code, headerStyle);
    });
  }
  if (s2Count > 0) {
    setCell(7, resitStart + s1Count, "S2", headerStyle);
    worksheet.mergeCells(7, resitStart + s1Count, 7, resitEnd);
    s2Subjects.forEach((subject, idx) => {
      setCell(8, resitStart + s1Count + idx, subject.code, headerStyle);
    });
  }

  // Apply italic to rows 5-7
  for (let rowNum = 5; rowNum <= 7; rowNum++) {
    for (let colNum = 1; colNum <= lastCol; colNum++) {
      const cell = worksheet.getCell(rowNum, colNum);
      cell.font = {
        ...(cell.font || { name: "Arial", size: 10 }),
        italic: true,
      };
    }
  }

  // ===========================
  // GRADE/GP HELPER FORMULAS
  // ===========================
  const gradeFormula = (ref: string) =>
    `IF(ISNUMBER(${ref}), IF(${ref}<25,"F", IF(${ref}<30,"D", IF(${ref}<35,"D+",IF(${ref}<40,"C-", IF(${ref}<46,"C", IF(${ref}<51,"C+", IF(${ref}<56,"B-", IF(${ref}<65,"B", IF(${ref}<70,"B+", IF(${ref}<75,"A-", IF(${ref}<90,"A",IF(${ref}<101,"A+\"))) ))))))))), "F")`;

  const gpFormula = (ref: string) =>
    `IF(ISNUMBER(${ref}), IF(${ref}<25,0, IF(${ref}<30,1, IF(${ref}<35,1.33, IF(${ref}<40,1.67, IF(${ref}<46,2, IF(${ref}<51,2.33, IF(${ref}<56,2.67, IF(${ref}<65,3, IF(${ref}<70,3.33, IF(${ref}<75,3.67, IF(${ref}<90,4, IF(${ref}<101,4))) ))))))))), 0)`;

  // ===========================
  // STUDENT DATA ROWS
  // ===========================
  normalizedStudents.forEach((student, index) => {
    const r = 8 + index;
    worksheet.getRow(r).height = H75;
    const rowRef = (col: number) => getCellRef(r, col);

    // Basic info
    setCell(r, 1, student.no, dataRowStyle);
    setCell(r, 2, student.rollNo, {
      ...dataRowStyle,
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { theme: 0, tint: 0 },
      },
    });
    const ciCell = worksheet.getCell(rowRef(3));
    ciCell.value = student.studentId;
    ciCell.font = { name: "Arial", size: 12 };
    Object.assign(ciCell, dataRowStyle);
    const naCell = worksheet.getCell(rowRef(4));
    naCell.value = student.name;
    naCell.font = { name: "Arial", size: 12 };
    Object.assign(naCell, dataRowStyle);

    // S1 subjects
    const s1CuCols: number[] = [];
    const s1MarksCols: number[] = [];
    const s1GpCols: number[] = [];

    student.s1Marks.forEach((marks, idx) => {
      const cuCol = s1Start + idx * SUBJECT_COLS;
      const marksCol = cuCol + 1;
      const gradeCol = cuCol + 2;
      const gpCol = cuCol + 3;

      s1CuCols.push(cuCol);
      s1MarksCols.push(marksCol);
      s1GpCols.push(gpCol);

      setCell(r, cuCol, 15, {
        ...dataBoldStyle,
        fill: {
          type: "pattern" as const,
          pattern: "solid" as const,
          fgColor: { argb: "FFD3D3D3" },
        },
      });
      setCell(r, marksCol, marks, dataBoldStyle);

      const marksRef = rowRef(marksCol);
      const cellG = worksheet.getCell(rowRef(gradeCol));
      cellG.value = { formula: gradeFormula(marksRef) };
      Object.assign(cellG, dataBoldStyle);

      const cellGP = worksheet.getCell(rowRef(gpCol));
      cellGP.value = { formula: gpFormula(marksRef) };
      Object.assign(cellGP, {
        ...dataBoldStyle,
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { theme: 0, tint: 0 },
        },
      });
    });

    // S2 subjects
    const s2CuCols: number[] = [];
    const s2MarksCols: number[] = [];
    const s2GpCols: number[] = [];

    student.s2Marks.forEach((marks, idx) => {
      const cuCol = s2Start + idx * SUBJECT_COLS;
      const marksCol = cuCol + 1;
      const gradeCol = cuCol + 2;
      const gpCol = cuCol + 3;

      s2CuCols.push(cuCol);
      s2MarksCols.push(marksCol);
      s2GpCols.push(gpCol);

      setCell(r, cuCol, 15, {
        ...dataBoldStyle,
        fill: {
          type: "pattern" as const,
          pattern: "solid" as const,
          fgColor: { argb: "FFD3D3D3" },
        },
      });
      setCell(r, marksCol, marks, dataBoldStyle);

      const marksRef = rowRef(marksCol);
      const cellG = worksheet.getCell(rowRef(gradeCol));
      cellG.value = { formula: gradeFormula(marksRef) };
      Object.assign(cellG, dataBoldStyle);

      const cellGP = worksheet.getCell(rowRef(gpCol));
      cellGP.value = { formula: gpFormula(marksRef) };
      Object.assign(cellGP, {
        ...dataBoldStyle,
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { theme: 0, tint: 0 },
        },
      });
    });

    // S1 Total
    if (s1Count > 0) {
      const cuFormula = `SUM(${s1CuCols.map((c) => rowRef(c)).join(",")})`;
      const marksFormula = `SUM(${s1MarksCols.map((c) => rowRef(c)).join(",")})`;
      const gpFormula = `SUM(${s1GpCols.map((c) => rowRef(c)).join(",")})`;

      worksheet.getCell(rowRef(s1TotalStart)).value = { formula: cuFormula };
      worksheet.getCell(rowRef(s1TotalStart + 1)).value = {
        formula: marksFormula,
      };
      worksheet.getCell(rowRef(s1TotalStart + 2)).value = {
        formula: gpFormula,
      };

      for (let c = 0; c < 3; c++) {
        Object.assign(
          worksheet.getCell(rowRef(s1TotalStart + c)),
          dataBoldStyle,
        );
      }
    }

    // S2 Total
    if (s2Count > 0) {
      const cuFormula = `SUM(${s2CuCols.map((c) => rowRef(c)).join(",")})`;
      const marksFormula = `SUM(${s2MarksCols.map((c) => rowRef(c)).join(",")})`;
      const gpFormula = `SUM(${s2GpCols.map((c) => rowRef(c)).join(",")})`;

      worksheet.getCell(rowRef(s2TotalStart)).value = { formula: cuFormula };
      worksheet.getCell(rowRef(s2TotalStart + 1)).value = {
        formula: marksFormula,
      };
      worksheet.getCell(rowRef(s2TotalStart + 2)).value = {
        formula: gpFormula,
      };

      for (let c = 0; c < 3; c++) {
        Object.assign(
          worksheet.getCell(rowRef(s2TotalStart + c)),
          dataBoldStyle,
        );
      }
    }

    // GPA
    if (s1Count > 0) {
      const s1Gpa = `((${s1CuCols.map((c, i) => `15*${rowRef(s1GpCols[i])}`).join(")+(")}))/${s1Count * 15}`;
      worksheet.getCell(rowRef(gpaStart)).value = { formula: s1Gpa };
    }
    if (s2Count > 0) {
      const s2Gpa = `((${s2CuCols.map((c, i) => `15*${rowRef(s2GpCols[i])}`).join(")+(")}))/${s2Count * 15}`;
      worksheet.getCell(rowRef(gpaStart + 1)).value = { formula: s2Gpa };
    }
    Object.assign(worksheet.getCell(rowRef(gpaStart)), dataBoldStyle);
    Object.assign(worksheet.getCell(rowRef(gpaStart + 1)), dataBoldStyle);

    // Semester Wise Remark
    if (s1Count > 0) {
      const marksFirstRef =
        s1MarksCols.length > 0 ? rowRef(s1MarksCols[0]) : "";
      const gradesAllA = s1MarksCols.map((c) => `${rowRef(c)}="A"`).join(",");
      const gradesAnyA = s1MarksCols.map((c) => `${rowRef(c)}="A"`).join(",");
      const gradesAnyFail = s1MarksCols.map((c) => `${rowRef(c)}<40`).join(",");

      const s1Remark = `IF(${marksFirstRef}="W","W",IF(AND(${gradesAllA}),"A",IF(OR(${gradesAnyA}),"Inc",IF(OR(${gradesAnyFail}),"F","P"))))`;
      worksheet.getCell(rowRef(semRemarkStart)).value = { formula: s1Remark };
    }
    if (s2Count > 0) {
      const marksFirstRef =
        s2MarksCols.length > 0 ? rowRef(s2MarksCols[0]) : "";
      const gradesAllA = s2MarksCols.map((c) => `${rowRef(c)}="A"`).join(",");
      const gradesAnyA = s2MarksCols.map((c) => `${rowRef(c)}="A"`).join(",");
      const gradesAnyFail = s2MarksCols.map((c) => `${rowRef(c)}<40`).join(",");

      const s2Remark = `IF(${marksFirstRef}="W","W",IF(AND(${gradesAllA}),"A",IF(OR(${gradesAnyA}),"Inc",IF(OR(${gradesAnyFail}),"F","P"))))`;
      worksheet.getCell(rowRef(semRemarkStart + 1)).value = {
        formula: s2Remark,
      };
    }
    Object.assign(worksheet.getCell(rowRef(semRemarkStart)), dataBoldStyle);
    Object.assign(worksheet.getCell(rowRef(semRemarkStart + 1)), dataBoldStyle);

    // Total (S1+S2) — CU, Marks, GP
    worksheet.getCell(rowRef(totalS1S2Start)).value = {
      formula: `SUM(${rowRef(s1TotalStart)},${rowRef(s2TotalStart)})`,
    };
    worksheet.getCell(rowRef(totalS1S2Start + 1)).value = {
      formula: `SUM(${rowRef(s1TotalStart + 1)},${rowRef(s2TotalStart + 1)})`,
    };
    worksheet.getCell(rowRef(totalS1S2Start + 2)).value = {
      formula: `SUM(${rowRef(s1TotalStart + 2)},${rowRef(s2TotalStart + 2)})`,
    };
    for (let c = 0; c < 3; c++) {
      Object.assign(
        worksheet.getCell(rowRef(totalS1S2Start + c)),
        dataBoldStyle,
      );
    }

    // Cumm: G.P.A
    worksheet.getCell(rowRef(cummGpaStart)).value = {
      formula: `IF(AND(${rowRef(gpaStart)}>0,${rowRef(gpaStart + 1)}>0),SUM(${rowRef(gpaStart)}:${rowRef(gpaStart + 1)})/2,0)`,
    };
    Object.assign(worksheet.getCell(rowRef(cummGpaStart)), dataBoldStyle);

    // Average Total Mark
    const totalMax = totalSubjects * 100;
    worksheet.getCell(rowRef(avgMarkStart)).value = {
      formula: `${rowRef(totalS1S2Start + 1)}*100/${totalMax}`,
    };
    Object.assign(worksheet.getCell(rowRef(avgMarkStart)), {
      ...dataBoldStyle,
      fill: yellowFill,
    });

    // Final Remark
    const s1SemRef = rowRef(semRemarkStart);
    const s2SemRef = rowRef(semRemarkStart + 1);
    worksheet.getCell(rowRef(finalRemarkStart)).value = {
      formula: `IF(OR(AND(${s1SemRef}="P",${s2SemRef}="F"),AND(${s1SemRef}="F",${s2SemRef}="P"),AND(${s1SemRef}="F",${s2SemRef}="F")),"Failed",IF(OR(AND(${s1SemRef}="A",${s2SemRef}="A"),AND(${s1SemRef}="A",${s2SemRef}="W"),AND(${s1SemRef}="W",${s2SemRef}="A")),"Absent",IF(OR(AND(${s1SemRef}="F",${s2SemRef}="W"),AND(${s1SemRef}="W",${s2SemRef}="F"),AND(${s1SemRef}="P",${s2SemRef}="W"),AND(${s1SemRef}="W",${s2SemRef}="P"),AND(${s1SemRef}="W",${s2SemRef}="W")),"Withdraw",IF(AND(${s1SemRef}="P",${s2SemRef}="P"),"Passed","Incomplete"))))`,
    };
    Object.assign(worksheet.getCell(rowRef(finalRemarkStart)), dataBoldStyle);

    // Compute remark in JS to set fill color directly
    const s1MarkVals = student.s1Marks;
    const s2MarkVals = student.s2Marks;
    const sem1Remark =
      s1MarkVals.length === 0 ? "" : s1MarkVals.some((m) => m < 40) ? "F" : "P";
    const sem2Remark =
      s2MarkVals.length === 0 ? "" : s2MarkVals.some((m) => m < 40) ? "F" : "P";

    let finalRemark: string;
    if (
      (sem1Remark === "P" && sem2Remark === "F") ||
      (sem1Remark === "F" && sem2Remark === "P") ||
      (sem1Remark === "F" && sem2Remark === "F")
    ) {
      finalRemark = "Failed";
    } else if (sem1Remark === "P" && sem2Remark === "P") {
      finalRemark = "Passed";
    } else {
      finalRemark = "";
    }

    const remarkBg: Record<string, string> = {
      Passed: "00e468",
      Failed: "FFFF0000",
    };
    if (finalRemark && remarkBg[finalRemark]) {
      worksheet.getCell(rowRef(finalRemarkStart)).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: remarkBg[finalRemark] },
      };
    }

    // Final Grade
    const avgRef = rowRef(avgMarkStart);
    worksheet.getCell(rowRef(finalGradeStart)).value = {
      formula: `IF(ISNUMBER(${avgRef}),IF(${avgRef}<25,"F",IF(${avgRef}<30,"D",IF(${avgRef}<35,"D+",IF(${avgRef}<40,"C-",IF(${avgRef}<46,"C",IF(${avgRef}<51,"C+",IF(${avgRef}<56,"B-",IF(${avgRef}<65,"B",IF(${avgRef}<70,"B+",IF(${avgRef}<75,"A-",IF(${avgRef}<90,"A",IF(${avgRef}<101,"A+\"))) ))))))))),"F")`,
    };
    Object.assign(worksheet.getCell(rowRef(finalGradeStart)), {
      ...dataBoldStyle,
      fill: yellowFill,
    });

    // Resit Modules
    s1GpCols.forEach((gpCol, idx) => {
      worksheet.getCell(rowRef(resitStart + idx)).value = {
        formula: `IF(${rowRef(gpCol)}<2,"${s1Subjects[idx].code}","")`,
      };
      Object.assign(worksheet.getCell(rowRef(resitStart + idx)), dataBoldStyle);
    });
    s2GpCols.forEach((gpCol, idx) => {
      worksheet.getCell(rowRef(resitStart + s1Count + idx)).value = {
        formula: `IF(${rowRef(gpCol)}<2,"${s2Subjects[idx].code}","")`,
      };
      Object.assign(
        worksheet.getCell(rowRef(resitStart + s1Count + idx)),
        dataBoldStyle,
      );
    });
  });

  // Auto filter on Marks (Total S1+S2) through Final Remark
  if (normalizedStudents.length > 0) {
    const lastDataRow = 7 + normalizedStudents.length;
    worksheet.autoFilter = {
      from: { row: 7, column: totalS1S2Start + 1 },
      to: { row: lastDataRow, column: finalRemarkStart },
    };
  }

  return workbook;
}

async function generateResultExcelBuffer(
  config: GenerateConfig,
): Promise<ArrayBuffer> {
  const workbook = await generateResultExcel(config);
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

async function generateAndDownloadResult(
  config: GenerateConfig,
  filename = "Student_Result.xlsx",
): Promise<void> {
  const buffer = await generateResultExcelBuffer(config);
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

export {
  generateResultExcel,
  generateResultExcelBuffer,
  generateAndDownloadResult,
  getCellRef,
  colLetterToNumber,
};
export type { Subject, StudentData, GenerateConfig };
