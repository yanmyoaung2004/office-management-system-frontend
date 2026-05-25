import type { AlertType } from "./common";

export interface Notification {
  id: string;
  userId?: string | null;
  studentId?: string | null;
  studentName?: string;
  title: string;
  message: string;
  alertType: AlertType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
}
