import XLSX from "xlsx";
import { hashPassword } from "../utils/hash";
import User, { IUser } from "../models/user.model";
import Organization, {
  OrganizationDocument,
} from "../models/organization.model";
import Group from "../models/group.model";
import SuperAdmin from "../models/superadmin.model";
import { sendLoginEmail } from "./sendMail.service";
import moment from "moment";
import mongoose from "mongoose";


class UserService {
  async createUsersFromExcel(
    organization: OrganizationDocument,
    buffer: Buffer
  ): Promise<{
    duplicateEmails: string[];
    duplicatePhones: string[];
  }> {
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
          throw new Error(
            `Row ${index + 1}: Missing required field "${field}".`
          );
        }
      });
    });

    const duplicateEmails: string[] = [];
    const duplicatePhones: string[] = [];
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const usersToCreate: any[] = [];

    const normalizePhone = (phone: string) =>
      phone.replace(/[\s()-]/g, "").trim();

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

      if (seenEmails.has(Email)) {
        duplicateEmails.push(Email);
        continue;
      }
      seenEmails.add(Email);

      const existingEmailAccount =
        (await Organization.findOne({ email: Email })) ||
        (await User.findOne({ email: Email })) ||
        (await SuperAdmin.findOne({ email: Email }));

      if (existingEmailAccount) {
        duplicateEmails.push(Email);
        continue;
      }

      const normalizedPhone = Phone ? normalizePhone(String(Phone)) : null;
      if (normalizedPhone && seenPhones.has(normalizedPhone)) {
        duplicatePhones.push(Phone);
        continue;
      }
      if (normalizedPhone) {
        seenPhones.add(normalizedPhone);

        const existingPhoneAccount =
          (await Organization.findOne({ phone: normalizedPhone })) ||
          (await User.findOne({ phone: normalizedPhone })) ||
          (await SuperAdmin.findOne({ phone: normalizedPhone }));

        if (existingPhoneAccount) {
          duplicatePhones.push(Phone);
          continue;
        }
      }

      let parsedDateOfBirth = null;
      if (DateOfBirth) {
        parsedDateOfBirth = moment(
          DateOfBirth,
          ["YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"],
          true
        ).toDate();
      }

      const groups: string[] = [];
      if (GroupId && mongoose.Types.ObjectId.isValid(GroupId)) {
        const group = await Group.findOne({
          _id: GroupId,
          organizationId: organization.id,
        });

        if (!group) {
          throw new Error(
            `Group with ID "${GroupId}" not found for this organization.`
          );
        }
        groups.push(GroupId);
      }

      usersToCreate.push({
        username: Username || null,
        firstName: FirstName,
        lastName: LastName,
        otherName: OtherName || null,
        email: Email,
        phone: normalizedPhone || undefined,
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

    if (duplicateEmails.length > 0 || duplicatePhones.length > 0) {
      return { duplicateEmails, duplicatePhones };
    }

    const createdUsers = await User.insertMany(usersToCreate);

    const emailPromises = createdUsers.map((user) => {
      const emailVariables = {
        email: user.email,
        firstName: user.firstName,
        password:
          user.password === hashedDefaultPassword
            ? defaultPassword
            : "DefaultPassword123",
        organizationName: organization.name,
        subject: "Onboarding Email",
      };

      return sendLoginEmail(emailVariables);
    });

    await Promise.all(emailPromises);

    return { duplicateEmails: [], duplicatePhones: [] };
  }
}

export default new UserService();

