import express from 'express';
import { LandingPageController } from '../controllers/landingpage.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../utils/upload.utils';
import { Multer, uploadImages } from '../utils/uploadImage.utils';

const router = express.Router();
const {CreateLandingPage,
    GetLandingPageById,
 GetAllLandingPages,
    DeleteLandingPage,
    UpdateLandingPage
} = new LandingPageController();

router.post('/', 
    authenticate,
    authorize("admin"), 
    upload.array("file", 5),
         CreateLandingPage);
router.get('/', authenticate, authorize("admin"),  GetAllLandingPages);
router.get('/:id', authenticate, authorize("admin"),  GetLandingPageById);
router.put('/:id', authenticate, authorize("admin"),  UpdateLandingPage);
router.delete('/:id', authenticate, authorize("admin"),  DeleteLandingPage);

export default router;
