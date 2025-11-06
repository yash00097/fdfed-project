import Notification from "../models/notification.model.js";


export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
}

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, message: "Notification marked as read", notification });
  } catch (error) {
    next(error);
  }
}

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
}

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification)
      return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, message: "Notification deleted", notification });
  } catch (error) {
    next(error);
  }
}
