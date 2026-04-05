import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Redirect to login page if not authenticated
    const router = inject(Router);
    return router.createUrlTree(['/login']);
};
