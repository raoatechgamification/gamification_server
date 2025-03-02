import dotenv from "dotenv";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ResponseHandler } from "../../middlewares/responseHandler.middleware";
import Course from "../../models/course.model";
import Group from "../../models/group.model";
import Organization, { IOrganization } from "../../models/organization.model";
import SubAdmin from "../../models/subadmin.model";
import SuperAdmin, { ISuperAdmin } from "../../models/superadmin.model";
import User, { IUser } from "../../models/user.model";
import { sendLoginEmail } from "../../services/sendMail.service";
import UserService from "../../services/user.service";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import { getOrganizationId } from "../../utils/getOrganizationId.util";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
dotenv.config();

export class UserAuthController {
  static async createSimpleUser(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        organizationId: orgaId,
      } = req.body;
      const courseId: any = req.query.courseId;

      const organizationId = process.env.LANDINGPAGE_ID;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !organizationId
      ) {
        return ResponseHandler.failure(res, "All fields are required", 400);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseHandler.failure(res, "Email already registered", 400);
      }

      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return ResponseHandler.failure(
          res,
          "Phone Number already registered",
          400
        );
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const hashedPassword = await hashPassword(password);

      const newUser = await User.create({
        createdBy: "Self-registered",
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        organizationId,
      });

      const userResponse: any = await User.findById(newUser._id).select(
        "-password"
      );
      let tokenPayload;
      let token;

      if (courseId) {
        const course = await Course.findById(courseId).lean();
        if (!course) {
          return ResponseHandler.failure(res, "Course not found", 404);
        }
        console.log(course, "course");

        // Prepare course assignment
        const adminId = newUser.organizationId; // Use the new user's organization ID
        const userIds = [newUser._id]; // Array with just the new user's ID
        const dueDate = new Date(); // You might want to make this configurable
        dueDate.setMonth(dueDate.getMonth() + 1); // Set default due date to 1 month from now

        let status = "unpaid";
        if (!course.cost || course.cost === 0) {
          status = "free";
        }

        const sanitizedCourse = { ...course };
        delete sanitizedCourse.assignedLearnerIds;
        delete sanitizedCourse.learnerIds;

        // Update user's program arrays if they don't exist
        await User.updateOne(
          {
            _id: newUser._id,
            $or: [{ unattemptedPrograms: { $exists: false } }],
          },
          {
            $set: {
              ongoingPrograms: [],
              completedPrograms: [],
              unattemptedPrograms: [],
            },
          }
        );

        // Assign course to user
        await User.updateOne(
          {
            _id: newUser._id,
            "assignedPrograms.courseId": { $ne: courseId },
          },
          {
            $push: {
              assignedPrograms: {
                courseId: new mongoose.Types.ObjectId(courseId),
                dueDate: new Date(dueDate),
                status,
                amount: course.cost,
              },
              unattemptedPrograms: {
                course: sanitizedCourse,
                status,
              },
            },
          }
        );

        // Update course with new learner
        const learnersToAdd = [
          {
            userId: newUser._id,
            progress: 0,
          },
        ];

        const updateQuery: any = {
          $addToSet: {
            learnerIds: { $each: learnersToAdd },
          },
        };

        if (status === "free") {
          updateQuery.$addToSet["learnerIds"] = { $each: learnersToAdd };
        }

        await Course.updateOne({ _id: courseId }, updateQuery);

        tokenPayload = UserAuthController.getUserTokenPayload(userResponse);
        console.log(tokenPayload, "signup");
        token = await generateToken(tokenPayload);
      }

      const userResponseWithoutPassword = await User.findById(
        newUser._id
      ).select("-password");
      return ResponseHandler.success(
        res,
        { userResponse: userResponseWithoutPassword, token, newUser },
        "User account created successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async createSingleUser(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        otherName,
        email,
        phone,
        gender,
        dateOfBirth,
        country,
        address,
        city,
        LGA,
        state,
        officeAddress,
        officeCity,
        officeLGA,
        officeState,
        employerName,
        role,
        batch,
        password: rawPassword,
        sendEmail,
        contactPersonPlaceOfEmployment,
        nameOfContactPerson,
        contactEmail,
        contactPersonPhoneNumber,
        ids = "[]",
      } = req.body;

      const image = req.file;

      const organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return ResponseHandler.failure(
          res,
          "Phone Number already registered",
          400
        );
      }

      let parsedIds: string[] = [];
      try {
        parsedIds = JSON.parse(ids);
      } catch (error) {
        return ResponseHandler.failure(res, "Invalid 'ids' format", 400);
      }

      const objectIds = parsedIds.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );

      const existingAccount =
        (await Organization.findOne({ email })) ||
        (await User.findOne({ email })) ||
        (await SuperAdmin.findOne({ email }));

      if (existingAccount) {
        return ResponseHandler.failure(res, "Email already registered", 400);
      }

      let fileUploadResult: any = null;
      if (image) {
        fileUploadResult = await uploadToCloudinary(
          image.buffer,
          image.mimetype,
          "userDisplayPictures"
        );
      }

      const password = rawPassword || `${firstName}${lastName}123#`;
      const hashedPassword = await hashPassword(password);

      const newUser = await User.create({
        firstName,
        lastName,
        otherName,
        email,
        phone: phone || null,
        gender,
        dateOfBirth,
        image: fileUploadResult ? fileUploadResult.secure_url : null,
        country,
        address,
        city,
        LGA,
        state,
        officeAddress,
        officeCity,
        officeLGA,
        employerName,
        officeState,
        role,
        batch,
        password: hashedPassword,
        organizationId,
        contactPersonPlaceOfEmployment,
        nameOfContactPerson,
        contactEmail,
        contactPersonPhoneNumber,
        createdBy: "Admin",
      });

      const userIdObject = newUser._id as mongoose.Types.ObjectId;

      const userGroups: mongoose.Types.ObjectId[] = [];
      const userSubGroups: mongoose.Types.ObjectId[] = [];

      const bulkOps: any[] = [];

      for (const id of objectIds) {
        const group = await Group.findOne({ _id: id, organizationId });
        if (group?.members) {
          group.members.push(userIdObject);
          bulkOps.push({
            updateOne: {
              filter: { _id: group._id },
              update: { members: group.members },
            },
          });
          if (!userGroups.includes(group._id)) {
            userGroups.push(group._id);
          }
          continue;
        }

        const groupWithSubgroup = await Group.findOne({
          "subGroups._id": id,
          organizationId,
        });

        if (groupWithSubgroup) {
          const subgroup = groupWithSubgroup.subGroups.find((sg) =>
            sg._id.equals(id)
          );
          if (subgroup) {
            subgroup.members.push(userIdObject);
            bulkOps.push({
              updateOne: {
                filter: { _id: groupWithSubgroup._id },
                update: { subGroups: groupWithSubgroup.subGroups },
              },
            });

            if (!userSubGroups.includes(subgroup._id)) {
              userSubGroups.push(subgroup._id);
            }
            if (!userGroups.includes(groupWithSubgroup._id)) {
              userGroups.push(groupWithSubgroup._id);
            }
          }
        }
      }

      if (bulkOps.length > 0) {
        await Group.bulkWrite(bulkOps);
      }

      newUser.groups = userGroups;
      newUser.subGroups = userSubGroups;
      await newUser.save();

      if (sendEmail) {
        const emailVariables = {
          email,
          firstName,
          password,
          organizationName: organization.name,
          subject: "Onboarding Email",
        };
        await sendLoginEmail(emailVariables);
      }

      const userResponse = await User.findById(newUser._id).select("-password");
      return res.status(201).json({
        message: "User account created successfully",
        userResponse,
        loginUrl: `${process.env.FRONTEND_BASEURL}/auth/login`,
      });
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  // static async createSingleUser(req: Request, res: Response) {
  //   try {
  //     let {
  //       firstName,
  //       lastName,
  //       otherName,
  //       email,
  //       phone,
  //       userId,
  //       groupId,
  //       gender,
  //       dateOfBirth,
  //       country,
  //       address,
  //       city,
  //       LGA,
  //       state,
  //       officeAddress,
  //       officeCity,
  //       officeLGA,
  //       officeState,
  //       employerName,
  //       role,
  //       batch,
  //       password,
  //       sendEmail,
  //       contactPersonPlaceOfEmployment,
  //       nameOfContactPerson,
  //       contactEmail,
  //       contactPersonPhoneNumber,
  //     } = req.body;

  //     const image = req.file;

  //     // const organizationId = req.admin._id;
  //     // let organizationId: mongoose.Schema.Types.ObjectId;
  //     // if (req.admin) {
  //     //   organizationId = req.admin._id;
  //     // } else if (req.user && req.user.role === "subAdmin") {
  //     //   const subAdmin = await SubAdmin.findById(req.user.id);
  //     //   console.log("req.user.id: ", req.user.id)
  //     //   if (!subAdmin) {
  //     //     return ResponseHandler.failure(res, "Subadmin not found", 404);
  //     //   }
  //     //   organizationId = subAdmin.organizationId; // Assuming subadmins have an organizationId field
  //     // } else {
  //     //   return ResponseHandler.failure(res, "Unauthorized access", 403);
  //     // }

  //     let organizationId = await getOrganizationId(req, res);
  //     if (!organizationId) {
  //       return;
  //     }

  //     const organization = await Organization.findById(organizationId);
  //     if (!organization) {
  //       return ResponseHandler.failure(res, "Organization not found", 400);
  //     }

  //     let fileUploadResult: any = null;

  //     if (image) {
  //       fileUploadResult = await uploadToCloudinary(
  //         image.buffer,
  //         image.mimetype,
  //         "userDisplayPictures"
  //       );
  //     }

  //     if (!password) {
  //       password = `${firstName}${lastName}123#`;
  //     }

  //     const existingAccount =
  //       (await Organization.findOne({ email })) ||
  //       (await User.findOne({ email })) ||
  //       (await SuperAdmin.findOne({ email }));

  //     if (existingAccount) {
  //       return ResponseHandler.failure(res, "Email already registered", 400);
  //     }

  //     if (groupId) {
  //       const group = await Group.findOne({
  //         _id: groupId,
  //         organizationId,
  //       });

  //       if (!group) {
  //         return ResponseHandler.failure(
  //           res,
  //           "Group not found for this organization",
  //           400
  //         );
  //       }
  //     }

  //     const hashedPassword = await hashPassword(password);

  //     const newUser = await User.create({
  //       firstName,
  //       lastName,
  //       otherName,
  //       email,
  //       phone,
  //       groups: [groupId],
  //       userId,
  //       gender,
  //       dateOfBirth,
  //       image: fileUploadResult ? fileUploadResult.secure_url : null,
  //       country,
  //       address,
  //       city,
  //       LGA,
  //       state,
  //       officeAddress,
  //       officeCity,
  //       officeLGA,
  //       employerName,
  //       officeState,
  //       password: hashedPassword,
  //       organizationId,
  //       batch,
  //       contactPersonPlaceOfEmployment,
  //       contactEmail,
  //       nameOfContactPerson,
  //       contactPersonPhoneNumber,
  //       userType: role,
  //     });

  //     const userResponse = await User.findById(newUser._id).select(
  //       "-password -role"
  //     );

  //     if (sendEmail) {
  //       const emailVariables = {
  //         email,
  //         firstName,
  //         password,
  //         organizationName: organization.name,
  //         subject: "Onboarding Email",
  //       };

  //       await sendLoginEmail(emailVariables);
  //     }

  //     return res.status(201).json({
  //       message: "User account created successfully",
  //       userResponse,
  //       loginUrl: `${process.env.FRONTENT_BASEURL}/auth/login`,
  //     });
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  static async bulkCreateUsers(req: Request, res: Response) {
    try {
      // const organizationId = req.admin._id;

      const organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      if (!req.file) {
        return ResponseHandler.failure(res, "No file uploaded", 400);
      }

      const { duplicateEmails, duplicatePhones } =
        await UserService.createUsersFromExcel(organization, req.file.buffer);

      if (duplicateEmails.length || duplicatePhones.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate entries found",
          data: {
            duplicateEmails,
            duplicatePhones,
          },
        });
      }

      res.status(201).json({
        success: true,
        message: "Users created successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred during bulk user creation",
        error: error.message,
      });
    }
  }

  static async registerUser(req: Request, res: Response) {
    try {
      let { email, username, organizationId, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return ResponseHandler.failure(
          res,
          `A user has been registered with this email`,
          400
        );
      }

      const usernameExists = await User.findOne({ username });

      if (usernameExists) {
        return ResponseHandler.failure(
          res,
          "This username is unavailable",
          400
        );
      }

      password = await hashPassword(password);

      if (organizationId) {
        const organizationDetails = await Organization.findById(organizationId);

        if (!organizationDetails)
          return ResponseHandler.failure(
            res,
            "Organization does not exist",
            400
          );
      }

      const newUser = await User.create({
        username,
        email,
        password,
        organization: organizationId,
      });

      const userResponse = await User.findById(newUser._id).select(
        "-password -role"
      );

      return ResponseHandler.success(
        res,
        userResponse,
        "User account created successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find all records with empty phone values

      // await Organization.findOneAndDelete({
      //   email: "richardsonmarcus520@gmail.com",
      // });
      // await User.findOneAndDelete({ email: "richardsonmarcus520@gmail.com" });
      // await SubAdmin.findOneAndDelete({
      //   email: "richardsonmarcus520@gmail.com",
      // });
      // await SuperAdmin.findOneAndDelete({
      //   email: "richardsonmarcus520@gmail.com",
      // });

      // await Organization.updateMany({ phone: "" }, { $set: { phone: null } });
      // await User.updateMany({ phone: "" }, { $set: { phone: null } });
      // await SubAdmin.updateMany({ phone: "" }, { $set: { phone: null } });
      // await SuperAdmin.updateMany({ phone: "" }, { $set: { phone: null } });

      // const emptyPhoneOrgs = await Organization.find({ phone: "" });
      // console.log(emptyPhoneOrgs, "631", emptyPhoneOrgs.length)
      // const emptyPhoneUsers = await User.find({ phone: "" });
      // console.log(emptyPhoneUsers, "633", emptyPhoneOrgs.length)
      // const emptyPhoneSubAdmins = await SubAdmin.find({ phone: "" });
      // console.log(emptyPhoneSubAdmins, "635", emptyPhoneSubAdmins.length)
      // const emptyPhoneSuperAdmins = await SuperAdmin.find({ phone: "" });
      // console.log(emptyPhoneSuperAdmins, "637", emptyPhoneSuperAdmins.length)

      // console.log(ajibade, "ajibade")
      const account: any =
        (await Organization.findOne({ email })) ||
        (await User.findOne({ email })) ||
        (await SubAdmin.findOne({ email })) ||
        (await SuperAdmin.findOne({ email }));

      if (!account) {
        return ResponseHandler.failure(res, "Account does not exist", 400);
      }

      const isCorrectPassword = await comparePassword(
        password,
        account.password
      );

      if (!isCorrectPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      let tokenPayload;
      switch (account.role) {
        case "admin":
          tokenPayload =
            UserAuthController.getOrganizationTokenPayload(account);
          break;
        case "superAdmin":
          tokenPayload = UserAuthController.getSuperAdminTokenPayload(account);
          break;
        case "subAdmin":
          tokenPayload =
            UserAuthController.getOrganizationTokenPayload(account);
          break;
        case "user":
          tokenPayload = UserAuthController.getUserTokenPayload(account);
          console.log(tokenPayload, "login");
          break;

        default:
          return ResponseHandler.failure(res, "Unknown role", 400);
      }

      const token = await generateToken(tokenPayload);

      const { password: _omit, ...accountData } = account.toObject();

      return ResponseHandler.loginResponse(
        res,
        token,
        accountData,
        "Login Successful"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  private static getUserTokenPayload(account: IUser) {
    return {
      id: account._id,
      email: account.email,
      username: account.username,
      phone: account.phone,
      organizationId: account.organizationId,
      firstName: account.firstName,
      lastName: account.lastName,
      otherName: account.otherName,
      image: account.image,
      role: account.role,
    };
  }

  private static getOrganizationTokenPayload(account: IOrganization) {
    return {
      id: account._id,
      role: account.role,
      name: account.name,
      email: account.email,
      preferredUrl: account.preferredUrl,
    };
  }

  private static getSuperAdminTokenPayload(account: ISuperAdmin) {
    return {
      id: account._id,
      email: account.email,
      username: account.username,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
    };
  }

  // static async loginUser(req: Request, res: Response) {
  //   try {
  //     const { email, password } = req.body;

  //     const registeredUser = await User.findOne({ email });

  //     if (!registeredUser) {
  //       return ResponseHandler.failure(res, "User does not exist", 400);
  //     }

  //     const checkPassword = await comparePassword(
  //       password,
  //       registeredUser.password
  //     );

  //     if (!checkPassword) {
  //       return ResponseHandler.failure(
  //         res,
  //         "You have entered an incorrect password",
  //         400
  //       );
  //     }

  //     const payload = {
  //       id: registeredUser._id,
  //       email: registeredUser.email,
  //       username: registeredUser.username,
  //       phone: registeredUser.phone,
  //       organizationId: registeredUser.organizationId,
  //       firstName: registeredUser.firstName,
  //       lastName: registeredUser.lastName,
  //       role: registeredUser.role,
  //     };

  //     const token = await generateToken(payload);

  //     const userResponse = await User.findById(registeredUser._id).select(
  //       "-password -role"
  //     );

  //     return ResponseHandler.loginResponse(
  //       res,
  //       token,
  //       userResponse,
  //       "Login Successful"
  //     );
  //   } catch (error: any) {
  //     res.status(500).json({
  //       message: "Server error",
  //       error: error.message,
  //     });
  //   }
  // }
}
