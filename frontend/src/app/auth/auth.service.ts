import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { API_CONFIG } from '../shared/constants/api.constant';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_CONFIG.GATEWAY_URL}/auth`; // API Gateway
  private isBrowser: boolean;
  public authEvents = new Subject<'login' | 'logout'>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private oauthService: OAuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.oauthService.configure(authConfig); // Ensure config is loaded
  }



  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('atg_access_token');
      localStorage.removeItem('atg_refresh_token');
      localStorage.removeItem('atg_user_id');
      localStorage.removeItem('atg_username');
      localStorage.removeItem('atg_first_name');
      localStorage.removeItem('atg_last_name');

      if (this.oauthService.hasValidAccessToken()) {
        this.oauthService.logOut();
      }
      this.authEvents.next('logout');
    }
    this.router.navigate(['/login']);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/access-token`, credentials).pipe(
      tap((response: any) => {
        if (this.isBrowser && response.accessToken) {
          localStorage.setItem('atg_access_token', response.accessToken);
          localStorage.setItem('atg_refresh_token', response.refreshToken);
          localStorage.setItem('atg_user_id', response.userId);
          localStorage.setItem('atg_username', response.username);
          localStorage.setItem('atg_first_name', response.firstName);
          localStorage.setItem('atg_last_name', response.lastName);
          this.authEvents.next('login');
        }
      })
    );
  }

  getCaptcha(): Observable<any> {
    return this.http.get(`${this.apiUrl}/captcha`);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.isBrowser ? localStorage.getItem('atg_refresh_token') : null;
    return this.http.post(`${this.apiUrl}/refresh-token`, {}, {
      headers: {
        'x-refresh-token': refreshToken || ''
      }
    }).pipe(
      tap((response: any) => {
        if (this.isBrowser && response.accessToken) {
          localStorage.setItem('atg_access_token', response.accessToken);
          localStorage.setItem('atg_refresh_token', response.refreshToken);
          localStorage.setItem('atg_user_id', response.userId);
          localStorage.setItem('atg_username', response.username);
          localStorage.setItem('atg_first_name', response.firstName);
          localStorage.setItem('atg_last_name', response.lastName);
          this.authEvents.next('login');
        }
      })
    );
  }



  exchangeKeycloakToken(keycloakToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/exchange-keycloak-token`, {
      keycloakToken: keycloakToken,
      platform: 'web',
      deviceToken: 'web-device'
    }).pipe(
      tap((response: any) => {
        if (this.isBrowser && response.accessToken) {
          localStorage.setItem('atg_access_token', response.accessToken);
          localStorage.setItem('atg_refresh_token', response.refreshToken);
          localStorage.setItem('atg_user_id', response.userId);
          localStorage.setItem('atg_username', response.username);
          localStorage.setItem('atg_first_name', response.firstName);
          localStorage.setItem('atg_last_name', response.lastName);
          this.authEvents.next('login');
        }
      })
    );
  }

  isAuthenticated(): boolean {
    if (this.isBrowser) {
      return !!localStorage.getItem('atg_access_token');
    }
    return false;
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('atg_access_token');
    }
    return null;
  }
}
