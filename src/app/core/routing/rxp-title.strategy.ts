import {
  Injectable, inject
} from '@angular/core';
import {
  TitleStrategy,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class RxpTitleStrategy extends TitleStrategy {

  private title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);

    // Check if the resolver data contains an experience title
    const expTitle = this.getExperienceTitle(snapshot.root);

    if (expTitle) {
      this.title.setTitle(`${expTitle} — RuralXperience`);
    } else if (routeTitle) {
      this.title.setTitle(routeTitle);
    } else {
      this.title.setTitle('RuralXperience');
    }
  }

  private getExperienceTitle(
    route: ActivatedRouteSnapshot
  ): string | null {
    if (route.data['experience']?.title) {
      return route.data['experience'].title;
    }
    for (const child of route.children) {
      const title = this.getExperienceTitle(child);
      if (title) return title;
    }
    return null;
  }
}
