import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  isAuthenticated() : boolean {
    return true;
  }

  hasRole(role: string) : boolean {
    return true;
  }
}
