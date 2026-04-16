import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getNotifications , markNotificationRead, markAllNotificationsRead, getUnreadCount, deleteNotification} from "../controllers/notification.controller.js";
import { cacheResponse } from "../middleware/cache.js";
import {
  notificationsCacheKey,
  unreadNotificationsCacheKey,
} from "../utils/cache.js";

const router = express.Router();


router.get(
  "/",
  verifyToken,
  cacheResponse("notifications:list", 60, (req) => notificationsCacheKey(req.user.id)),
  getNotifications
);


router.put("/:id/mark-read", verifyToken, markNotificationRead);

router.get(
  '/unread-count',
  verifyToken,
  cacheResponse("notifications:unread", 30, (req) =>
    unreadNotificationsCacheKey(req.user.id)
  ),
  getUnreadCount
);

router.put("/mark-all-read", verifyToken, markAllNotificationsRead);

router.delete('/:id', verifyToken, deleteNotification);


export default router;
