import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Start actions
    fetchNotificationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    markAsReadStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    markAllAsReadStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteNotificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUnreadCountStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Success actions
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notif => !notif.read).length;
      state.error = null;
    },
    fetchUnreadCountSuccess: (state, action) => {
      state.loading = false;
      state.unreadCount = action.payload;
      state.error = null;
    },
    markAsReadSuccess: (state, action) => {
      state.loading = false;
      const notificationId = action.payload;
      state.notifications = state.notifications.map(notif =>
        notif._id === notificationId ? { ...notif, read: true } : notif
      );
      state.unreadCount = state.notifications.filter(notif => !notif.read).length;
    },
    markAllAsReadSuccess: (state) => {
      state.loading = false;
      state.notifications = state.notifications.map(notif => ({ ...notif, read: true }));
      state.unreadCount = 0;
    },
    deleteNotificationSuccess: (state, action) => {
      state.loading = false;
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(notif => notif._id !== notificationId);
      state.unreadCount = state.notifications.filter(notif => !notif.read).length;
    },
    deleteMultipleNotificationsSuccess: (state, action) => {
      state.loading = false;
      const notificationIds = action.payload;
      state.notifications = state.notifications.filter(notif => !notificationIds.includes(notif._id));
      state.unreadCount = state.notifications.filter(notif => !notif.read).length;
    },

    // Failure actions
    fetchNotificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUnreadCountFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    markAsReadFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    markAllAsReadFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteNotificationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  }
})

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  fetchUnreadCountStart,
  fetchUnreadCountSuccess,
  fetchUnreadCountFailure,
  markAsReadStart,
  markAsReadSuccess,
  markAsReadFailure,
  markAllAsReadStart,
  markAllAsReadSuccess,
  markAllAsReadFailure,
  deleteNotificationStart,
  deleteNotificationSuccess,
  deleteNotificationFailure,
  deleteMultipleNotificationsSuccess,
} = notificationSlice.actions;

export default notificationSlice.reducer;
