import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('AuthGuard checking path:', state.url);
    if (authService.isAuthenticated()) {
        console.log('AuthGuard: Authenticated, allowing access');
        return true;
    }

    // Redirect to login page if not authenticated
    console.log('AuthGuard: Not authenticated, redirecting to /login');
    return router.createUrlTree(['/login']);
};
