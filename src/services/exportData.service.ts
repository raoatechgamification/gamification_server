import fs from 'fs';
import { format } from '@fast-csv/format';
import { Response } from 'express';
import path from 'path';

interface DataRow {
  [key: string]: any;
}

export const exportDataAsCSV = async (data: DataRow[], res: Response): Promise<void> => {
  const filePath = path.join(__dirname, '../../exports', `data_${Date.now()}.csv`);
  const writeStream = fs.createWriteStream(filePath);
  const csvStream = format({ headers: true });

  csvStream.pipe(writeStream).on('end', () => writeStream.end());

  data.forEach(row => csvStream.write(row));
  csvStream.end();

  writeStream.on('finish', () => {
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading the file", err);
      }
      fs.unlinkSync(filePath); 
    });
  });
};
