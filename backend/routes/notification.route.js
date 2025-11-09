import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getNotifications , markNotificationRead, markAllNotificationsRead, getUnreadCount, deleteNotification} from "../controllers/notification.controller.js";

const router = express.Router();


router.get("/", verifyToken, getNotifications);


router.put("/:id/mark-read", verifyToken, markNotificationRead);

router.get('/unread-count',verifyToken, getUnreadCount);

router.put("/mark-all-read", verifyToken, markAllNotificationsRead);

router.delete('/:id', verifyToken, deleteNotification);


export default router;
