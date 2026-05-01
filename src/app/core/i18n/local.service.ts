import {
  Injectable, inject, signal, computed, PLATFORM_ID, LOCALE_ID
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT }  from '@angular/common';
import { DateAdapter }        from '@angular/material/core';

export type SupportedLocale = 'en-GB' | 'fr';

const LOCALE_STORAGE_KEY = 'rxp_locale';

@Injectable({ providedIn: 'root' })
export class LocaleService {

  private dateAdapter   = inject(DateAdapter);
  private platformId    = inject(PLATFORM_ID);
  private document      = inject(DOCUMENT);

  // Inject Angular's built-in LOCALE_ID to know exactly which build we are running.
  // This will be 'fr' if running on localhost:4200/fr/ and 'en-GB' on localhost:4200/
  private angularLocale = inject(LOCALE_ID);

  // Initialize the signal based on the ACTUAL build locale
  private _locale = signal<SupportedLocale>(
    this.angularLocale.startsWith('fr') ? 'fr' : 'en-GB'
  );

  readonly locale     = this._locale.asReadonly();
  readonly isFrench   = computed(() => this._locale() === 'fr');

  readonly dateLocale = computed(() =>
    this._locale() === 'fr' ? 'fr-FR' : 'en-GB'
  );

  constructor() {
    // Automatically sync Angular Material's date adapter with the current build locale
    this.dateAdapter.setLocale(this.dateLocale());
  }

  setLocale(newLocale: SupportedLocale): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // If they are already on the requested locale, do nothing
    if (this.locale() === newLocale) return;

    // Persist choice to localStorage (useful if you set up a server-side router later)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

    // Get the current path the user is on (e.g., "/experiences/123")
    const currentPath = this.document.location.pathname;

    if (newLocale === 'fr') {
      // Redirect to the French build
      this.document.location.href = `/fr${currentPath}`;
    } else {
      // Redirect back to the English (default) build
      const newPath = currentPath.replace('/fr', '');
      this.document.location.href = newPath === '' ? '/' : newPath;
    }
  }
}
