// import fs from "fs";
// import { format } from "@fast-csv/format";
// import { Response } from "express";
// import path from "path";
// import ExcelJS from "exceljs";

// interface DataRow {
//   [key: string]: any;
// }

// export const exportDataAsCSV = async (
//   data: DataRow[],
//   res: Response
// ): Promise<void> => {
//   const filePath = path.join(
//     __dirname,
//     "../../exports",
//     `data_${Date.now()}.csv`
//   );
//   const writeStream = fs.createWriteStream(filePath);
//   const csvStream = format({ headers: true });

//   csvStream.pipe(writeStream).on("end", () => writeStream.end());

//   data.forEach((row) => csvStream.write(row));
//   csvStream.end();

//   writeStream.on("finish", () => {
//     res.download(filePath, (err) => {
//       if (err) {
//         console.error("Error downloading the file", err);
//       }
//       fs.unlinkSync(filePath);
//     });
//   });
// };

// export const exportDataAsExcel = async (
//   data: DataRow[],
//   res: Response
// ): Promise<void> => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Data Export");

//   // Add header row based on the keys of the first item
//   worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

//   // Add rows
//   data.forEach((item) => worksheet.addRow(item));

//   const filePath = path.join(
//     __dirname,
//     "../../exports",
//     `data_${Date.now()}.xlsx`
//   );
//   await workbook.xlsx.writeFile(filePath);

//   res.download(filePath, (err) => {
//     if (err) {
//       console.error("Error downloading the file", err);
//     }
//     fs.unlinkSync(filePath);
//   });
// };


import { format } from "@fast-csv/format";
import { Response } from "express";
import ExcelJS from "exceljs";

interface DataRow {
  [key: string]: any;
}

export const exportDataAsCSV = async (
  data: DataRow[],
  res: Response
): Promise<void> => {
  res.setHeader("Content-Disposition", `attachment; filename="data_${Date.now()}.csv"`);
  res.setHeader("Content-Type", "text/csv");

  // Create a CSV stream and directly pipe to the response
  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  // Write each row to the CSV stream
  data.forEach((row) => csvStream.write(row));
  csvStream.end();
};

export const exportDataAsExcel = async (
  data: DataRow[],
  res: Response
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Export");

  // Add header row based on the keys of the first item
  worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

  // Add rows
  data.forEach((item) => worksheet.addRow(item));

  // Set headers to prompt download in browser
  res.setHeader("Content-Disposition", `attachment; filename="data_${Date.now()}.xlsx"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  // Write workbook to the response directly
  await workbook.xlsx.write(res);
  res.end();
};
