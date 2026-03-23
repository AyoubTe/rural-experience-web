import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {LocaleService, SupportedLocale} from '@rxp/core/i18n/local.service';
import {MatButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';

interface LocaleOption {
  code:  SupportedLocale;
  label: string;
  flag:  string;
}

@Component({
  selector: 'rxp-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  locale = inject(LocaleService);

  readonly localeOptions: LocaleOption[] = [
    { code: 'en-GB', label: 'English', flag: '🇬🇧' },
    { code: 'fr',    label: 'Français', flag: '🇫🇷' },
  ];

  currentOption = computed(
    () => this.localeOptions.find(
      o => o.code === this.locale.locale()
    ) ?? this.localeOptions[0]
  );
}
