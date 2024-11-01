import XLSX from 'xlsx';
import { hashPassword } from "../utils/hash"
import User, { IUser } from '../models/user.model';
import mongoose from 'mongoose';

class UserService {
  async createUsersFromExcel(organizationId: mongoose.Schema.Types.ObjectId, buffer: Buffer): Promise<IUser[]> {
    // Parse the Excel file from the buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert sheet data to JSON array
    const userData = XLSX.utils.sheet_to_json(sheet);

    // Map data and hash passwords
    const users = await Promise.all(userData.map(async (data: any) => {
      const hashedPassword = await hashPassword(data.password)
     
      return {
        username: data.Username,
        firstName: data.FirstName,
        lastName: data.LastName,
        email: data.Email,
        phone: data.Phone,
        organization: organizationId,
        password: hashedPassword,
      };
    }));

    // Insert users in bulk to MongoDB
    const createdUsers = await User.insertMany(users);
    return createdUsers;
  }


  // async createUsersFromExcel(organizationName:string, filePath: string): Promise<IUser[]> {
  //   // Read the file
  //   const workbook = XLSX.readFile(filePath);
  //   const sheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[sheetName];
    
  //   // Convert sheet data to JSON
  //   const userData = XLSX.utils.sheet_to_json(sheet);

  //   // Validate and transform data as needed
  //   const users = userData.map((data: any) => ({
  //     firstName: data.FirstName,
  //     lastName: data.LastName,
  //     email: data.Email,
  //     password: data.Password, // assume passwords are pre-hashed
  //   }));

  //   // Insert users in bulk
  //   const createdUsers = await User.insertMany(users);
  //   return createdUsers;
  // }
}

export default new UserService();
