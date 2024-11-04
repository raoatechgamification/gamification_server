import mongoose from 'mongoose';
import XLSX from 'xlsx';
import { hashPassword } from "../utils/hash"
import User, { IUser } from '../models/user.model';
import { OrganizationDocument } from "../models/organization.model"
import { sendLoginEmail } from "./sendMail.service";

class UserService {
  async createUsersFromExcel(organization: OrganizationDocument, buffer: Buffer): Promise<IUser[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const userData = XLSX.utils.sheet_to_json(sheet);
    const requiredFields = ['Email', 'Phone', 'FirstName'];

    for (let i = 0; i < userData.length; i++) {
      const data: any = userData[i];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error(`Row ${i + 1}: Missing required field "${field}"`);
        }
      }
    }
    
    const defaultPassword = "DefaultPassword123";  
    const hashedDefaultPassword = await hashPassword(defaultPassword);

    const users = userData.map((data: any) => ({
      username: data.Username || null,
      firstName: data.FirstName,
      lastName: data.LastName || null,
      email: data.Email,
      phone: data.Phone,
      organization: organization.id,
      password: hashedDefaultPassword,
    }));

    const createdUsers = await User.insertMany(users);

    for (const user of createdUsers) {
      const emailVariables = {
        email: user.email,
        firstName: user.firstName,
        password: defaultPassword,
        organizationName: organization.name,
        subject: "Gamai - Your New Account Login Details"
      }

      await sendLoginEmail(emailVariables);  
    }

    return createdUsers;
  }
}

export default new UserService();
