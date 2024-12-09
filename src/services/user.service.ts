import XLSX from "xlsx";
import { hashPassword } from "../utils/hash";
import User, { IUser } from "../models/user.model";
import Organization, { OrganizationDocument } from "../models/organization.model";
import SuperAdmin from "../models/superadmin.model";
import { sendLoginEmail } from "./sendMail.service";

class UserService {
  async createUsersFromExcel(
    organization: OrganizationDocument,
    buffer: Buffer
  ): Promise<IUser[]> {
    const MAX_ENTRIES = 1000;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const userData: any = XLSX.utils.sheet_to_json(sheet);
    const requiredFields = ["Email", "Phone", "FirstName", "UserID", "Image", "Country", "Password"];

    if (userData.length > MAX_ENTRIES) {
      throw new Error(
        `The file contains ${userData.length} entries, which exceeds the maximum allowed limit of ${MAX_ENTRIES}.`
      );
    }

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

    const usersToCreate: any[] = [];

    for (const data of userData) {
      const { Email, FirstName, LastName, OtherName, Phone, Username } = data;
      
      const existingAccount =
        (await Organization.findOne({ email: Email })) ||
        (await User.findOne({ email: Email })) ||
        (await SuperAdmin.findOne({ email: Email }));

      if (existingAccount) {
        throw new Error(`Email "${Email}" already registered`);
      }

      const existingPhone = 
        (await Organization.findOne({ phone: Phone })) ||
        (await User.findOne({ phone: Phone })) ||
        (await SuperAdmin.findOne({ phone: Phone }));

      if (existingPhone) {
        throw new Error(`Phone "${Phone}" already registered`);
      }

      usersToCreate.push({
        username: Username || null,
        firstName: FirstName,
        lastName: LastName || null,
        otherName: OtherName || null,
        email: Email,
        phone: Phone,
        organizationId: organization.id,
        password: hashedDefaultPassword,
      });
    }

    const createdUsers = await User.insertMany(usersToCreate);

    // Cast the result to the IUser type
    const users = createdUsers.map((user: any) => user.toObject()) as IUser[];

    // Send onboarding emails to created users
    for (const user of users) {
      if (!user.firstName) {
        throw new Error(`User ${user.email} is missing a first name.`);
      }

      const emailVariables = {
        email: user.email,
        firstName: user.firstName,
        password: defaultPassword,
        organizationName: organization.name,
        subject: "Onboarding Email",
      };

      await sendLoginEmail(emailVariables);
    }

    return users;
  }

  // async createUsersFromExcel(
  //   organization: OrganizationDocument,
  //   buffer: Buffer
  // ): Promise<IUser[]> {
  //   const MAX_ENTRIES = 1000;
  //   const workbook = XLSX.read(buffer, { type: "buffer" });
  //   const sheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[sheetName];

  //   const userData: any = XLSX.utils.sheet_to_json(sheet);
  //   const requiredFields = ["Email", "Phone", "FirstName"];

  //   if (userData.length > MAX_ENTRIES) {
  //     throw new Error(
  //       `The file contains ${userData.length} entries, which exceeds the maximum allowed limit of ${MAX_ENTRIES}.`
  //     );
  //   }

  //   for (let i = 0; i < userData.length; i++) {
  //     const data: any = userData[i];
  //     for (const field of requiredFields) {
  //       if (!data[field]) {
  //         throw new Error(`Row ${i + 1}: Missing required field "${field}"`);
  //       }
  //     }
  //   }

  //   const defaultPassword = "DefaultPassword123";
  //   const hashedDefaultPassword = await hashPassword(defaultPassword);

  //   const usersToCreate: any[] = [];

  //   for (const data of userData) {
  //     const { Email, FirstName, LastName, Phone, Username } = data;
      
  //     const existingAccount =
  //       (await Organization.findOne({ email: Email })) ||
  //       (await User.findOne({ email: Email })) ||
  //       (await SuperAdmin.findOne({ email: Email }));

  //     if (existingAccount) {
  //       throw new Error(`Email "${Email}" already registered`);
  //     }

  //     const existingPhone = 
  //       (await Organization.findOne({ phone: Phone })) ||
  //       (await User.findOne({ phone: Phone })) ||
  //       (await SuperAdmin.findOne({ phone: Phone }));

  //     if (existingPhone) {
  //       throw new Error(`Phone "${Phone}" already registered`);
  //     }

  //     usersToCreate.push({
  //       username: Username || null,
  //       firstName: FirstName,
  //       lastName: LastName || null,
  //       email: Email,
  //       phone: Phone,
  //       organizationId: organization.id,
  //       password: hashedDefaultPassword,
  //     });
  //   }

  //   const createdUsers = await User.insertMany(usersToCreate);

  //   // Cast the result to the IUser type
  //   const users = createdUsers.map((user: any) => user.toObject()) as IUser[];

  //   // Send onboarding emails to created users
  //   for (const user of users) {
  //     if (!user.firstName) {
  //       throw new Error(`User ${user.email} is missing a first name.`);
  //     }

  //     const emailVariables = {
  //       email: user.email,
  //       firstName: user.firstName,
  //       password: defaultPassword,
  //       organizationName: organization.name,
  //       subject: "Onboarding Email",
  //     };

  //     await sendLoginEmail(emailVariables);
  //   }

  //   return users;
  // }
}

export default new UserService();
