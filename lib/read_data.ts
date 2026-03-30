import * as XLSX from "xlsx";

// Define the shape of your data for type safety
interface StudentData {
  fullName: string;
  education: string;
  gender: string;
  birthdate: string; // ISO string format recommended
  phoneNumber: string;
  nrc: string;
  street: string;
  city: string;
  region: string;
  parentName: string;
  parentPhone: string;
  email: string;
  intake: string;
  status: string;
  enrolledDate: string;
}

/**
 * Reads an Excel file and maps it to a strictly typed JSON array.
 * @param filePath Path to the source .xlsx file
 */
export function convertExcelToJson(filePath: string): StudentData[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Extract raw data as an array of objects
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

  // Map and sanitize keys to match our interface
  return rawData.map(
    (row): StudentData => ({
      fullName: row["full name"] || "",
      education: row["education"] || "",
      gender: row["gender"] || "",
      birthdate: row["birthdate"] || "",
      phoneNumber: row["phonenumber"] || "",
      nrc: row["nrc"] || "",
      street: row["street"] || "",
      city: row["city"] || "",
      region: row["region"] || "",
      parentName: row["parentname"] || "",
      parentPhone: row["parentphone"] || "",
      email: row["email"] || "",
      intake: row["intake"] || "",
      status: row["status"] || "",
      enrolledDate: row["enrolled_date"] || "",
    }),
  );
}

// Usage
