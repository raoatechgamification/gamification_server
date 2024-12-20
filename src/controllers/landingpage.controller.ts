import { Request, Response, NextFunction } from 'express';
import { LandingPage } from '../models/landingPage.model';
import  Course  from '../models/course.model';
import {Types} from "mongoose"
import { Subservice } from '../models/subService.model';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
export class LandingPageController {
  async CreateLandingPage(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const organizationId = req.admin._id
      const {
        title,
        description,
        requirement,
        topContent,
        landingPageTitle,
        serviceTitleDescription,
        serviceType,
        serviceItem,
        serviceItemDescription,
        courseCode,
        courseLevel,
        duration,
        startDate,
        endDate,
        numberOfHoursPerDay,
        numberOfDaysPerWeek,
        cost,
        promo,
        promoCode,
        promoValue,
        platformCharge,
        actualCost,
        sharing,
        sharingValue,
        visibilityStartDate,
        visibilityEndDate,
        visibilityStartTime,
        visibilityEndTime,
        teachingMethod,
        subservice,
      } = req.body;
  

      
        // if(title){
        //    const existingCourse = await Course.findOne({ title });
        // if (existingCourse) {
        //     return res.status(400).json({
        //         success: false,
        //         message: `A course with the title "${title}" already exists.`,
        //     });
        // }
        // }
       
      let { course } = req.body;
  
      // Ensure course is an array
      if (!Array.isArray(course)) {
        // If course is undefined or an object, convert it to an array
        course = course ? [course] : [];
      }
  
      // If no course data exists, create one from the extracted fields
      if (course.length === 0) {
        course.push({
          title,
          description,
          requirement,
          topContent,
          courseCode,
          courseLevel,
          duration,
          startDate,
          endDate,
          numberOfHoursPerDay: Number(numberOfHoursPerDay),
          numberOfDaysPerWeek: Number(numberOfDaysPerWeek),
          cost: Number(cost),
          promo: Number(promo),
          promoCode,
          promoValue: Number(promoValue),
          platformCharge: Number(platformCharge),
          actualCost: Number(actualCost),
          sharing: Number(sharing),
          sharingValue: Number(sharingValue),
          visibilityStartDate,
          visibilityEndDate,
          visibilityStartTime,
          visibilityEndTime,
          teachingMethod,
          organizationId
        });
      }
  
      let Urls: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
      }
  
      const courseIds: Types.ObjectId[] = [];
      const subserviceIds: Types.ObjectId[] = [];
  
      const existingLandingPage = await LandingPage.findOne({ landingPageTitle });
      if (existingLandingPage) {
        return res.status(400).json({ success: false, message: `A landing page with the title "${landingPageTitle}" already exists.` });
      }
      // Create or fetch Courses
      for (const courseData of course) {
        if (courseData._id) {
          // If course ID exists, validate it
          const existingCourse = await Course.findById(courseData._id);
          if (!existingCourse) {
            return res
              .status(400)
              .json({ success: false, message: `Course with ID ${courseData._id} not found.` });
          }
          courseIds.push(existingCourse._id as Types.ObjectId);
        } else {
          // Create a new Course
           if(title){
           const existingCourse = await Course.findOne({ title });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: `A course with the title "${title}" already exists.`,
            });
        }
        }
         courseData.courseImage = Urls[1]
          courseData.curriculum = Urls[2];
          console.log(courseData, "courseData");
          const newCourse = await Course.create(courseData);
          console.log(newCourse);
          courseIds.push(newCourse._id as Types.ObjectId);
        }
      }

      // Create or fetch Subservices
      for (const subserviceData of subservice || []) {
        if (subserviceData._id) {
          // If service ID exists, validate it
          const existingService = await Subservice.findById(subserviceData._id);
          if (!existingService) {
            return res.status(400).json({ success: false, message: `Service with ID ${subserviceData._id} not found.` });
          }
          subserviceIds.push(existingService._id as Types.ObjectId);
        } else {
          // Create a new Service
          const newService = await Subservice.create(subserviceData);
          subserviceIds.push(newService._id as Types.ObjectId);
        }
      }

      // Create LandingPage
      const newLandingPage = await LandingPage.create({
        organizationId,
        landingPageTitle,
        serviceTitleDescription,
        servicePicture: Urls[0], // Cloudinary URL for service picture
        
        serviceType,
        serviceItem,
        serviceItemDescription,
        course: courseIds,
        subservice: subserviceIds,
      });

      res.status(201).json({ success: true, data: newLandingPage });
    } catch (error) {
      next(error);
    }
  }

  async UpdateLandingPageWithCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // LandingPage ID
     console.log(id)
      const files = req.files as Express.Multer.File[]; // Uploaded files
      const organizationId = req.admin._id; // Admin ID from authentication middleware
  
      const {
        title,
          description,
          requirement,
          topContent,
        courseCode,
        courseLevel,
        duration,
        startDate,
        endDate,
        numberOfHoursPerDay,
        numberOfDaysPerWeek,
        cost,
        promo,
        promoCode,
        promoValue,
        platformCharge,
        actualCost,
        sharing,
        sharingValue,
        visibilityStartDate,
        visibilityEndDate,
        visibilityStartTime,
        visibilityEndTime,
        teachingMethod,
        
      } = req.body;
  
      const existingCourse = await Course.findOne({ title });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: `A course with the title "${title}" already exists.`,
            });
        }
      // Prepare the course data
      let newCourseData = {
        title,
          description,
          requirement,
          topContent,
        courseCode,
        courseLevel,
        duration,
        startDate,
        endDate,
        numberOfHoursPerDay: Number(numberOfHoursPerDay),
        numberOfDaysPerWeek: Number(numberOfDaysPerWeek),
        cost: Number(cost),
        promo: Number(promo),
        promoCode,
        promoValue: Number(promoValue),
        platformCharge: Number(platformCharge),
        actualCost: Number(actualCost),
        sharing: Number(sharing),
        sharingValue: Number(sharingValue),
        visibilityStartDate,
        visibilityEndDate,
        visibilityStartTime,
        visibilityEndTime,
        teachingMethod,
        organizationId,
        courseImage: "",
        curriculum: ""
      };
  
      let Urls: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
      }
  
      // Attach curriculum file if provided
      if (Urls.length > 0) {
              newCourseData["courseImage"] = Urls[0];
        newCourseData["curriculum"] = Urls[1];
      }
  
      // Create the new course
      const newCourse = await Course.create(newCourseData);
  
      // Validate and update the LandingPage
      const landingPage = await LandingPage.findById(id);
    
      if (!landingPage) {
        return res.status(404).json({
          success: false,
          message: `LandingPage with ID ${id} not found.`,
        });
      }
  
      // Update the LandingPage with the new course
      landingPage.course.push(newCourse._id as Types.ObjectId);
      await landingPage.save();
  
      res.status(200).json({
        success: true,
        message: "New course created and added to the LandingPage.",
        data: { course: newCourse, updatedLandingPage: landingPage },
      });
    } catch (error) {
      next(error);
    }
  }
  

  async GetAllLandingPages(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.admin._id; 
      const landingPages = await LandingPage.find({organizationId})
        .populate('course') // Populate course details
        .populate('subservice'); // Populate subservice details
      res.status(200).json({ data: landingPages });
    } catch (error) {
      next(error);
    }
  }

  async GetAllRaoatechLandingPages(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = process.env.LANDINGPAGE_ID
      const landingPages = await LandingPage.find({organizationId})
        .populate('course') // Populate course details
        .populate('subservice'); // Populate subservice details
      res.status(200).json({ data: landingPages });
    } catch (error) {
      next(error);
    }
  }

  async GetAllTotalLandingPages(req: Request, res: Response, next: NextFunction) {
    try {
      
      const landingPages = await LandingPage.find()
        .populate('course') // Populate course details
        .populate('subservice'); // Populate subservice details
    
        res.status(200).json({ data: landingPages });
    } catch (error) {
      next(error);
    }
  }

  async GetLandingPageById(req: Request, res: Response, next: NextFunction) {
    try {
      const landingPageId = req.params.id;
      const landingPage = await LandingPage.findById(landingPageId)
        .populate('course') // Populate course details
        .populate('subservice'); // Populate subservice details

      if (!landingPage) {
        return res.status(404).json({ message: 'Landing Page not found' });
      }

      res.status(200).json({ data: landingPage });
    } catch (error) {
      next(error);
    }
  }

  async updateLandingPageDetails(req: Request, res: Response, next: NextFunction) {
   

    try {
      const { id } = req.params; // ID of the landing page to update
      const {
        landingPageTitle,
        serviceTitleDescription,
        serviceType,
        serviceItem,
        serviceItemDescription,
        servicePicture: existingPicture, // If it's a Cloudinary URL
      } = req.body;
  
      const updateData: Record<string, any> = {
        landingPageTitle,
        serviceTitleDescription,
        serviceType,
        serviceItem,
        serviceItemDescription,
      };
  
      const files = req.files as Express.Multer.File[];
      console.log(files, "files 359")
      // Handle servicePicture
      let Urls: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
            updateData.servicePicture = uploadResult.secure_url;
          }
        }
      }
   
  
      // Update the landing page in the database
      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
  
      if (!updatedLandingPage) {
        return res
          .status(404)
          .json({ success: false, message: "Landing page not found" });
      }
  
      res
        .status(200)
        .json({ success: true, message: "Landing page updated", data: updatedLandingPage });
    } catch (error) {
      next(error);
    }
  }
  

  // PUT - Update a Landing Page by ID
  // async UpdateLandingPage(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const landingPageId = req.params.id;
  //     const { landingPageTitle, serviceTitleDescription, servicePicture, serviceType, serviceItem, serviceItemDescription, courses, subservices } = req.body;

  //     // Update the Course information if provided
  //     const courseIds = [];
  //     for (const courseData of courses) {
  //       let existingCourse = await Course.findOne({ courseCode: courseData.courseCode });
  //       if (!existingCourse) {
  //         existingCourse = new Course(courseData);
  //         await existingCourse.save();
  //       }
  //       courseIds.push(existingCourse._id);
  //     }

  //     // Update the Service information if provided
  //     const serviceIds = [];
  //     for (const serviceData of subservices) {
  //       let existingService = await Subservice.findOne({ title: serviceData.title });
  //       if (!existingService) {
  //         existingService = new Subservice(serviceData);
  //         await existingService.save();
  //       }
  //       serviceIds.push(existingService._id);
  //     }

  //     const updatedLandingPage = await LandingPage.findByIdAndUpdate(
  //       landingPageId,
  //       {
  //         landingPageTitle,
  //         serviceTitleDescription,
  //         servicePicture,
  //         serviceType,
  //         serviceItem,
  //         serviceItemDescription,
  //         course: courseIds,
  //         subservice: serviceIds
  //       },
  //       { new: true }
  //     );

  //     if (!updatedLandingPage) {
  //       return res.status(404).json({ message: 'Landing Page not found' });
  //     }

  //     console.log(updatedLandingPage)
  //     res.status(200).json({ message: 'Landing Page updated successfully', data: updatedLandingPage });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // DELETE - Delete a Landing Page by ID
  async DeleteLandingPage(req: Request, res: Response, next: NextFunction) {
    try {
      const landingPageId = req.params.id;

      const landingPage = await LandingPage.findByIdAndDelete(landingPageId);

      if (!landingPage) {
        return res.status(404).json({ message: 'Landing Page not found' });
      }

      res.status(200).json({ message: 'Landing Page deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Other CRUD methods remain the same...
}
