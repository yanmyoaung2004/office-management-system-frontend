"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Trash2, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types";
import useSWR from "swr";
import { apiDelete, apiPatch } from "@/lib/api-client";
import { toast } from "sonner";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const swrOptions = {
  revalidateOnFocus: false, // Don't refetch when you click back on the window
  revalidateOnReconnect: false, // Don't refetch when internet reconnects
  dedupingInterval: 60000, // Consider data "fresh" for 1 minute
};

interface NotificationProps {
  currentRole: string;
}

export function Notification({ currentRole }: NotificationProps) {
  const { data: notificationsResponse, mutate: mutateNotifications } = useSWR<
    PaginatedResponse<Notification>
  >(
    currentRole !== "staff" ? "/notifications?page=1&limit=200" : null,
    swrOptions,
  );

  const unreadNotifications = notificationsResponse?.data ?? [];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await apiPatch(`/notifications/${notification.id}/`, {
        isRead: true,
      });
      await mutateNotifications();
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await apiDelete(`/notifications/${notificationId}/`);
      await mutateNotifications();
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiPatch("/notifications-all/mark-all-read/");
      await mutateNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Bulk update failed:", error);
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "FOLLOW_UP":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "ENROLLMENT":
        return "bg-green-50 border-l-4 border-green-500";
      case "DROPOUT":
        return "bg-red-50 border-l-4 border-red-500";
      case "DOCUMENT":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      default:
        return "bg-muted border-l-4 border-muted-foreground";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="hover:bg-muted"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadNotifications.length > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 w-96 max-h-96 shadow-lg z-50 overflow-hidden border rounded-xl">
          <div className="bg-card border-b border-border px-4 py-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {unreadNotifications.length} unread
                </p>
              </div>
              {unreadNotifications.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  className="text-xs rounded-lg"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark All
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-80 ">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${getAlertColor(notification.alertType)} p-4 border-b border-border transition-opacity`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-foreground">
                          {notification.title}
                        </h4>
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {notification.alertType}
                        </span>
                      </div>
                      <p className="text-xs text-foreground mb-2">
                        {notification.message}
                      </p>
                      {notification.studentName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Student: <strong>{notification.studentName}</strong>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification)}
                        className="text-muted-foreground"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4 hover:text-white" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(notification.id)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 " />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-blue-50">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-xs mt-1">You&apos;re all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
