import XLSX from "xlsx";
import { hashPassword } from "../utils/hash";
import User, { IUser } from "../models/user.model";
import Organization, { OrganizationDocument } from "../models/organization.model";
import Group from "../models/group.model";
import SuperAdmin from "../models/superadmin.model";
import { sendLoginEmail } from "./sendMail.service";
import moment from "moment";


const convertExcelDate = (serialDate: number) => {
  const parsedDate = XLSX.SSF.parse_date_code(serialDate);
  if (parsedDate) {
    return new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d).toISOString().split('T')[0]; // Convert to YYYY-MM-DD
  }
  throw new Error(`Invalid Excel serial date: ${serialDate}`);
};

class UserService {
  async createUsersFromExcel(
    organization: OrganizationDocument,
    buffer: Buffer
  ): Promise<IUser[]> {
    const MAX_ENTRIES = 1000;
    const defaultPassword = "DefaultPassword123";
    const hashedDefaultPassword = await hashPassword(defaultPassword);
  
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
  
    const userData: any[] = XLSX.utils.sheet_to_json(sheet);
    const requiredFields = ["Email", "FirstName", "LastName"];
  
    if (userData.length > MAX_ENTRIES) {
      throw new Error(
        `The file contains ${userData.length} entries, which exceeds the maximum allowed limit of ${MAX_ENTRIES}.`
      );
    }
  
    userData.forEach((data, index) => {
      requiredFields.forEach((field) => {
        if (!data[field]) {
          throw new Error(`Row ${index + 1}: Missing required field "${field}".`);
        }
      });
    });
  
    const usersToCreate: any[] = [];
  
    for (const data of userData) {
      const {
        Email,
        FirstName,
        LastName,
        Password,
        GroupId,
        OtherName,
        Phone,
        Username,
        Batch,
        Gender,
        DateOfBirth,
        Country,
        Address,
        City,
        LGA,
        State,
        OfficeAddress,
        OfficeCity,
        OfficeLGA,
        OfficeState,
        EmployerName,
      } = data;
  
      const existingAccount =
        (await Organization.findOne({ email: Email })) ||
        (await User.findOne({ email: Email })) ||
        (await SuperAdmin.findOne({ email: Email }));
  
      if (existingAccount) {
        throw new Error(`Email "${Email}" is already registered.`);
      }
  
      if (Phone) {
        const existingPhone =
          (await Organization.findOne({ phone: Phone })) ||
          (await User.findOne({ phone: Phone })) ||
          (await SuperAdmin.findOne({ phone: Phone }));
  
        if (existingPhone) {
          throw new Error(`Phone "${Phone}" is already registered.`);
        }
      }

      let parsedDateOfBirth = null;
      if (DateOfBirth) {
        console.log(`Raw DateOfBirth for ${Email}:`, DateOfBirth);

        if (typeof DateOfBirth === "number") {
          const excelEpoch = moment("1900-01-01").add(DateOfBirth - 2, "days");
          parsedDateOfBirth = excelEpoch.utc().toDate();
        } else {
          const parsedDate = moment(DateOfBirth, ["YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"], true);
          if (parsedDate.isValid()) {
            parsedDateOfBirth = parsedDate.utc().toDate();
          } else {
            throw new Error(
              `Invalid DateOfBirth format for email "${Email}". Expected format: YYYY-MM-DD.`
            );
          }
        }
      }

      const groups: string[] = [];
      if (GroupId) {
        const group = await Group.findOne({
          _id: GroupId,
          organizationId: organization.id,
        });
  
        if (!group) {
          throw new Error(`Group with ID "${GroupId}" not found for this organization.`);
        }
        groups.push(GroupId);
      }
  
      usersToCreate.push({
        username: Username || null,
        firstName: FirstName,
        lastName: LastName,
        otherName: OtherName || null,
        email: Email,
        phone: Phone || null,
        groups: groups.length ? groups : null,
        organizationId: organization.id,
        password: Password
          ? await hashPassword(Password)
          : hashedDefaultPassword, 
        batch: Batch || null,
        gender: Gender || null,
        dateOfBirth: parsedDateOfBirth,
        country: Country || null,
        address: Address || null,
        city: City || null,
        LGA: LGA || null,
        state: State || null,
        officeAddress: OfficeAddress || null,
        officeCity: OfficeCity || null,
        officeLGA: OfficeLGA || null,
        officeState: OfficeState || null,
        employerName: EmployerName || null,
      });
    }
  
    const createdUsers = await User.insertMany(usersToCreate);
  
    const users = createdUsers.map((user: any) => user.toObject()) as IUser[];
  
    for (const user of users) {
      const emailVariables = {
        email: user.email,
        firstName: user.firstName,
        password: user.password === hashedDefaultPassword ? defaultPassword : "Provided Password",
        organizationName: organization.name,
        subject: "Onboarding Email",
      };
  
      await sendLoginEmail(emailVariables);
    }
  
    return users;
  }

  // async createUsersFromExcell(
  //   organization: OrganizationDocument,
  //   buffer: Buffer
  // ): Promise<IUser[]> {
  //   const MAX_ENTRIES = 1000;
  //   const defaultPassword = "DefaultPassword123";
  //   const hashedDefaultPassword = await hashPassword(defaultPassword);
  
  //   const workbook = XLSX.read(buffer, { type: "buffer" });
  //   const sheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[sheetName];
  
  //   const userData: any[] = XLSX.utils.sheet_to_json(sheet);
  //   const requiredFields = ["Email", "FirstName", "LastName"];
  
  //   if (userData.length > MAX_ENTRIES) {
  //     throw new Error(
  //       `The file contains ${userData.length} entries, which exceeds the maximum allowed limit of ${MAX_ENTRIES}.`
  //     );
  //   }
  
  //   // Validate required fields
  //   userData.forEach((data, index) => {
  //     requiredFields.forEach((field) => {
  //       if (!data[field]) {
  //         throw new Error(`Row ${index + 1}: Missing required field "${field}".`);
  //       }
  //     });
  //   });
  
  //   const usersToCreate: any[] = [];
  
  //   for (const data of userData) {
  //     const {
  //       Email,
  //       FirstName,
  //       LastName,
  //       Password,
  //       GroupId,
  //       OtherName,
  //       Phone,
  //       Username,
  //       Batch,
  //       Gender,
  //       DateOfBirth,
  //       Country,
  //       Address,
  //       City,
  //       LGA,
  //       State,
  //       OfficeAddress,
  //       OfficeCity,
  //       OfficeLGA,
  //       OfficeState,
  //       EmployerName,
  //     } = data;
  
  //     // Check for duplicate email
  //     const existingAccount =
  //       (await Organization.findOne({ email: Email })) ||
  //       (await User.findOne({ email: Email })) ||
  //       (await SuperAdmin.findOne({ email: Email }));
  
  //     if (existingAccount) {
  //       throw new Error(`Email "${Email}" is already registered.`);
  //     }
  
  //     // Check for duplicate phone number
  //     if (Phone) {
  //       const existingPhone =
  //         (await Organization.findOne({ phone: Phone })) ||
  //         (await User.findOne({ phone: Phone })) ||
  //         (await SuperAdmin.findOne({ phone: Phone }));
  
  //       if (existingPhone) {
  //         throw new Error(`Phone "${Phone}" is already registered.`);
  //       }
  //     }
  
  //     // Validate and add group if GroupId is provided
  //     const groups: string[] = [];
  //     if (GroupId) {
  //       const group = await Group.findOne({
  //         _id: GroupId,
  //         organizationId: organization.id,
  //       });
  
  //       if (!group) {
  //         throw new Error(`Group with ID "${GroupId}" not found for this organization.`);
  //       }
  //       groups.push(GroupId);
  //     }
  
  //     // Prepare user object
  //     usersToCreate.push({
  //       username: Username || null,
  //       firstName: FirstName,
  //       lastName: LastName,
  //       otherName: OtherName || null,
  //       email: Email,
  //       phone: Phone || null,
  //       groups: groups.length ? groups : null,
  //       organizationId: organization.id,
  //       password: Password
  //         ? await hashPassword(Password)
  //         : hashedDefaultPassword, // Use provided password or default
  //       batch: Batch || null,
  //       gender: Gender || null,
  //       dateOfBirth: DateOfBirth || null,
  //       country: Country || null,
  //       address: Address || null,
  //       city: City || null,
  //       LGA: LGA || null,
  //       state: State || null,
  //       officeAddress: OfficeAddress || null,
  //       officeCity: OfficeCity || null,
  //       officeLGA: OfficeLGA || null,
  //       officeState: OfficeState || null,
  //       employerName: EmployerName || null,
  //     });
  //   }
  
  //   // Insert users into the database
  //   const createdUsers = await User.insertMany(usersToCreate);
  
  //   // Cast the result to IUser type
  //   const users = createdUsers.map((user: any) => user.toObject()) as IUser[];
  
  //   // Send onboarding emails to created users
  //   for (const user of users) {
  //     const emailVariables = {
  //       email: user.email,
  //       firstName: user.firstName,
  //       password: user.password === hashedDefaultPassword ? defaultPassword : "Provided Password",
  //       organizationName: organization.name,
  //       subject: "Onboarding Email",
  //     };
  
  //     await sendLoginEmail(emailVariables);
  //   }
  
  //   return users;
  // }
}

export default new UserService();
