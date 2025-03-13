import { Router } from "express";
import {
  authenticate,
  authorize,
  checkSubadminPermission,
} from "../middlewares/auth.middleware";
import { bulkUpload } from "../utils/upload.utils";
import {
  createOrganizationValidator,
  loginValidator,
} from "../validators/organization.auth.validator";

import { superAdminValidator } from "../validators/superadmin.validator";

import { AdminAuthController } from "../controllers/auth/auth.admin.controller";
import { SubAdminController } from "../controllers/auth/auth.subadmin.controller";
import { SuperAdminAuthController } from "../controllers/auth/auth.superadmin.controller";
import { UserAuthController } from "../controllers/auth/auth.user.controller";

// import { generateJitsiJWT } from "../utils/JitsiJWT";
import { upload } from "../utils/upload.utils";
const { registerOrganization, loginOrganization } = AdminAuthController;
const {
  registerUser,
  bulkCreateUsers,
  createSingleUser,
  createSimpleUser,
  login,
  forgotPassword,
  resetPassword,
} = UserAuthController;
const { registerSuperAdmin, loginSuperAdmin } = SuperAdminAuthController;
const { createSubAdminAccount, loginSubAdmin, editSubAdminAccount } =
  new SubAdminController();

const router = Router();

router.post("/login", ...loginValidator, login);

// Sub-admin account creation
router.post(
  "/subadmin/register",
  authenticate,
  authorize(["admin"]),
  upload.single("image"),
  createSubAdminAccount
);

// login sub admin
router.post("/subadmin/login", loginSubAdmin);

// Assign permissions to sub-admin
router.put(
  "/subadmin/:subAdminId",
  authenticate,
  authorize(["admin"]),
  editSubAdminAccount
);

// Organization Auth
router.post(
  "/org/register",
  ...createOrganizationValidator,
  registerOrganization
);

// User Auth
router.post(
  "/bulk-create",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Add User"),
  bulkUpload.single("file"),
  bulkCreateUsers
);

router.post(
  "/single-create",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Add User"),
  upload.single("image"),
  createSingleUser
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/create-user-self", createSimpleUser);

// Super Admin Auth
router.post("/super-admin/signup", ...superAdminValidator, registerSuperAdmin);

// router.get("/get-jitsi-token", async (req, res) => {
//   try {
//     // Read the private key, ensure it's a valid RSA PEM private key
//     const privateKey = fs.readFileSync(
//       path.join(__dirname, "Key 3_12_2025, 11_29_45 AM.pk"),
//       "utf8"
//     );
//     //const privateKey = process.env.PRIVATE_KEY;
//     console.log(privateKey, 109);
//     const token = generate(privateKey, {
//       id: uuidv4(),
//       name: "ajibadeemmanuel58",
//       avatar: "",
//       email: "ajibadeemmanuel58@gmail.com",
//       appId: "vpaas-magic-cookie-e2c62d128f394864a5c13e8fc9f9bc0c",
//       kid: "vpaas-magic-cookie-e2c62d128f394864a5c13e8fc9f9bc0c/2bda53",
//     });
//     res.json({ token });
//   } catch (err: any) {
//     console.error("Error generating token:", err.message); // Log the actual error message
//     res.status(500).json({ error: "Error generating token" });
//   }
// });
export default router;
