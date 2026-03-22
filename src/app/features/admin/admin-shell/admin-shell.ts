import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'rxp-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatTabNav,
    MatTabLink,
    RouterLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {

}
