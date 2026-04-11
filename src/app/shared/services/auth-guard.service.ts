import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from './user.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = localStorage.getItem("user_");
        if (localStorage.getItem('u_token')) {
            if (this.userService.isTokenExpired(localStorage.getItem('u_token'))) {
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }
            else {
                return true;
            }
        }
        else {

            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }
    }
}