import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    let authReq = req;
    if (token) {
        authReq = addToken(req, token);
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                    // Ignore 401 for login request as it's a genuine failure
                    if (req.url.includes('/access-token')) {
                        return throwError(() => error);
                    }
                    return handle401Error(authReq, next, authService);
                } else if (error.status === 403) {
                    router.navigate(['/403']);
                }
            }
            return throwError(() => error);
        })
    );
};

const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) => {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
            switchMap((token: any) => {
                isRefreshing = false;
                refreshTokenSubject.next(token.accessToken);
                return next(addToken(request, token.accessToken));
            }),
            catchError((err) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => err);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
                return next(addToken(request, jwt!));
            })
        );
    }
};

const addToken = (request: HttpRequest<any>, token: string) => {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
};
