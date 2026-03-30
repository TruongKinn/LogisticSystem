import { Component, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from './auth/auth.service';
import { UserService } from './shared/services/user.service';
import { WebSocketNotificationService } from './shared/services/ws-notification.service';
import { NotificationService } from './shared/services/notification.service';
import { NotificationMessage } from './shared/models/notification.model';
import { API_CONFIG } from './shared/constants/api.constant';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NzLayoutModule,
    NzButtonModule,
    NzMenuModule,
    NzIconModule,
    NzTypographyModule,
    NzCardModule,
    NzToolTipModule,
    NzAvatarModule,
    NzPopoverModule,
    NzDividerModule,
    NzBadgeModule,
    NzListModule,
    NzTagModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isCollapsed = false;
  isBrowser: boolean;
  isDarkMode = false;
  showLayout = true;
  avatarUrl?: string;

  unreadCount$: Observable<number>;
  notifications$: Observable<NotificationMessage[]>;
  isNotifPopoverVisible = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private wsNotifService: WebSocketNotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.unreadCount$ = this.wsNotifService.unreadCount$;
    this.notifications$ = this.wsNotifService.notifications$;
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Subscribe to router events to handle layout visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.showLayout = !url.includes('/login') && !url.includes('/register');
    });

    if (this.isBrowser) {
      // Load saved theme if any
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.toggleTheme();
      }

      window.addEventListener('avatar-updated', (event: any) => {
        if (event.detail) {
          this.avatarUrl = event.detail;
        } else {
          this.loadUserAvatar();
        }
      });

      // Listen for auth events (login/logout) to sync UI
      this.authService.authEvents.subscribe(event => {
        if (event === 'login') {
          this.loadUserAvatar();
          this.wsNotifService.connect();
        } else if (event === 'logout') {
          this.avatarUrl = undefined;
          this.wsNotifService.disconnect();
        }
      });
    }
  }

  ngOnInit() {
    if (this.isBrowser && this.isLoggedIn) {
      this.loadUserAvatar();
      this.wsNotifService.connect();
    }
  }

  onPopoverVisibleChange(visible: boolean): void {
    if (visible) {
      // Bỏ tự động markAllAsRead
    }
  }

  markAsRead(item: NotificationMessage) {
    if (item.isRead || !item.id) return;
    this.wsNotifService.markAsRead(item.id);
  }

  markAllAsRead() {
    this.wsNotifService.markAllAsRead();
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      ORDER_CREATED: 'blue',
      PAYMENT_SUCCESS: 'green',
      PAYMENT_FAILED: 'red',
      INVENTORY_LOW: 'orange',
      GENERAL: 'default'
    };
    return map[type] || 'default';
  }

  sendTestWsNotification() {
    const mockPayload = {
      title: 'Hệ thống Real-time',
      message: 'Đây là thông báo test kiểm tra hệ thống Websocket lúc ' + new Date().toLocaleTimeString(),
      type: 'GENERAL',
      recipientId: localStorage.getItem('atg_user_id') || undefined
    };

    this.notificationService.sendWsNotification(mockPayload).subscribe({
      next: (res) => console.log('Bấm Test Web Socket Thành công:', res),
      error: (err) => console.error('Lỗi khi gửi Test Socket:', err)
    });
  }

  loadUserAvatar() {
    const userId = localStorage.getItem('atg_user_id');
    if (userId) {
      // Check if avatar is in local storage first
      const storedAvatar = localStorage.getItem('atg_avatar_url');
      if (storedAvatar) {
        this.avatarUrl = storedAvatar;
      }

      // Always fetch latest to ensure it's up to date
      this.userService.getUserDetails(+userId).subscribe({
        next: (user: any) => {
          if (user.avatarUrl) {
            const fullUrl = `${API_CONFIG.MINIO_URL}/${user.avatarUrl}?t=${new Date().getTime()}`;
            console.log('App Component Avatar URL:', fullUrl);
            this.avatarUrl = fullUrl;
            localStorage.setItem('atg_avatar_url', fullUrl);
          } else {
            localStorage.removeItem('atg_avatar_url');
          }
        },
        error: (err) => console.error('Failed to load user avatar', err)
      });
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isBrowser) {
      if (this.isDarkMode) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    }
  }

  get isLoggedIn() {
    return this.authService.isAuthenticated();
  }

  get username() {
    if (this.isBrowser) {
      const firstName = localStorage.getItem('atg_first_name');
      const lastName = localStorage.getItem('atg_last_name');
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      return localStorage.getItem('atg_username') || 'User';
    }
    return 'User';
  }

  get userInitials() {
    if (this.isBrowser) {
      const firstName = localStorage.getItem('atg_first_name');
      const lastName = localStorage.getItem('atg_last_name');
      if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      }
      const username = localStorage.getItem('atg_username');
      return username ? username.charAt(0).toUpperCase() : 'U';
    }
    return 'U';
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    if (this.isBrowser) {
      localStorage.removeItem('atg_avatar_url');
    }
  }
}
