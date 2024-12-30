// import { DecodedToken } from "../interfaces/DecodedToken";
import { User } from "../../models/user.model";
import { Organization } from "../../models/organization.model";
import { SuperAdmin } from "../../models/superadmin.model";
import { UploadedFile } from 'express-fileupload';


declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: Organization | undefined;
      superAdmin?: SuperAdmin | undefined;
      files?: {
        [key: string]: UploadedFile | UploadedFile[];
      };
    }
  }
}
