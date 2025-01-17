import mongoose from "mongoose";
import connectDB from "../config/db"
import Permission from "./permission.model";
import Role from "./role.model";

const seedPermissions = async () => {
  const permissions = [
    // User Management Permissions
    { module: "User Management", action: "Add User" },
    { module: "User Management", action: "Edit User" },
    { module: "User Management", action: "View All Users" },
    { module: "User Management", action: "Archive User" },
    { module: "User Management", action: "Disable User" },
    { module: "User Management", action: "Enable User" },
    { module: "User Management", action: "Access a User" },
    { module: "User Management", action: "Assign Contents to Group of Users" },

    // Course Management Permissions
    { module: "Course Management", action: "Create Course" },
    { module: "Course Management", action: "Create Lesson" },
    { module: "Course Management", action: "Edit Course" },
    { module: "Course Management", action: "View Course" },
    { module: "Course Management", action: "View Lesson" },
    { module: "Course Management", action: "Assign Course to User/Group" },
    { module: "Course Management", action: "View All Courses" },
    { module: "Course Management", action: "View All Lessons" },
    { module: "Course Management", action: "Delete Course" },
    { module: "Course Management", action: "Delete Lesson" },
    { module: "Course Management", action: "Archive Course" },
    { module: "Course Management", action: "Get User Programs"},
    { module: "Course Management", action: "Get Marketplace"},
    { module: "Course Management", action: "Get Course Report"},


    // Assessment Management Permissions
    { module: "Assessment Management", action: "Create Objective Assessment" },
    { module: "Assessment Management", action: "Create Theory Assessment" },
    { module: "Assessment Management", action: "View All Assessments" },
    { module: "Assessment Management", action: "Edit Assessment" },
    { module: "Assessment Management", action: "View Assessment Result" },

    // Announcement Management Permissions
    { module: "Announcement Management", action: "Create Announcement"},
    { module: "Announcement Management", action: "View All Announcements"},
    { module: "Announcement Management", action: "View Announcement"},
  ];

  await Permission.deleteMany(); // Clear existing permissions
  const createdPermissions = await Permission.insertMany(permissions);

  console.log("Permissions seeded:", createdPermissions);
};

const seedRoles = async () => {
  const adminPermissions = await Permission.find(); // Admin gets all permissions
  const subadminPermissions = await Permission.find({
    module: { $in: ["User Management", "Course Management", "Assessment Management"] },
  });

  const roles = [
    {
      name: "Admin",
      permissions: adminPermissions.map((perm: { _id: any; }) => perm._id),
    },
    {
      name: "Subadmin",
      permissions: subadminPermissions.map((perm: { _id: any; }) => perm._id),
    },
  ];

  await Role.deleteMany(); // Clear existing roles
  const createdRoles = await Role.insertMany(roles);

  console.log("Roles seeded:", createdRoles);
};

const seedDatabase = async () => {
  try {
    await connectDB(); // Use the connectDB function from db.ts

    await seedPermissions();
    await seedRoles();

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();
