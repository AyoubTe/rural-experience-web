import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LoginRequest} from '@rxp/core/models/requests.model';
import {API_ENDPOINTS} from '@rxp/core/constants/endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private basUrl = environment.API_BASE_URL;
  private http = inject(HttpClient);

  isAuthenticated() : boolean {
    return true;
  }

  hasRole(role: string) : boolean {
    return true;
  }

  login(loginParms: LoginRequest) {
    return this.http.post(environment.API_BASE_URL + API_ENDPOINTS.AUTH.LOGIN, loginParms)
  }
}
