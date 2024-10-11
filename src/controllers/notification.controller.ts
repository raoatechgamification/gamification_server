import { Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

export class NotificationController {
  async createNotification({ userId, courseId, message }: any) {
    try {
      await Notification.create({
        userId,
        courseId,
        message,
      });
    } catch (error) {
      console.error("Error creating notification: ", error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const notifications = await Notification.find({ userId }).sort({
        createdAt: -1,
      });
      return ResponseHandler.success(
        res,
        notifications,
        "Notifications fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return ResponseHandler.failure(res, "Notification not found", 404);
      }

      return ResponseHandler.success(
        res,
        notification,
        "Notification marked as read"
      );
    } catch (error) {
      next(error);
    }
  }
}
