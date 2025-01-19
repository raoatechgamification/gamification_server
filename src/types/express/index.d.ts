// import { DecodedToken } from "../interfaces/DecodedToken";
import { User } from "../../models/user.model";
import { Organization } from "../../models/organization.model";
import { SuperAdmin } from "../../models/superadmin.model";
import { SubAdmin } from "../../models/subadmin.model";
import { IPermission } from "../../models/permission.model";
import { UploadedFile } from "express-fileupload";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: Organization | undefined;
      subAdmin?: SubAdmin | undefined;
      superAdmin?: SuperAdmin | undefined;
      subadminPermissions?: IPermission[] | undefined;
      files?: {
        [key: string]: UploadedFile | UploadedFile[];
      };
    }
  }
}
