import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();

  add(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id);
    }, newNotification.duration);
  }

  remove(id: string) {
    const currentNotifications = this.notifications.value;
    this.notifications.next(currentNotifications.filter(n => n.id !== id));
  }

  clear() {
    this.notifications.next([]);
  }

  // Convenience methods
  success(title: string, message: string, duration?: number) {
    this.add({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    this.add({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    this.add({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    this.add({ type: 'info', title, message, duration });
  }
} 