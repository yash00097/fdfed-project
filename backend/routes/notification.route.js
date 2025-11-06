import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getNotifications , markNotificationRead, markAllNotificationsRead, getUnreadCount, deleteNotification} from "../controllers/notification.controller.js";

const router = express.Router();

// 📨 Get all notifications for a user
router.get("/", verifyToken, getNotifications);

// ✅ Mark a single notification as read
router.put("/:id/mark-read", verifyToken, markNotificationRead);

router.get('/unread-count',verifyToken, getUnreadCount);

// ✅ Mark all notifications as read
router.put("/mark-all-read", verifyToken, markAllNotificationsRead);

router.delete('/:id', verifyToken, deleteNotification);


export default router;
