import { Injectable } from '@angular/core';
import {CreateExperienceRequest} from '@rxp/core/models/requests.model';
import {Observable} from 'rxjs';
import {Experience} from '@rxp/core/models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class HostExperienceService {

  createExperience (request: CreateExperienceRequest) {
    return new Observable<Experience>();
  }
}
