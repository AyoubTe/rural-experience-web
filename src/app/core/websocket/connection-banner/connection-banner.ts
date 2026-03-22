import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RxStompService} from '@rxp/core/websocket/rxstomp-service';
import {AuthService} from '@rxp/core/auth/auth-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {RxStompState} from '@stomp/rx-stomp';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'rxp-connection-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon
  ],
  templateUrl: './connection-banner.html',
  styleUrl: './connection-banner.scss',
})
export class ConnectionBanner {
  private wsService = inject(RxStompService);
  private auth      = inject(AuthService);

  showBanner = toSignal(
    this.wsService.connectionState$.pipe(
      map(state =>
        // Show banner only when authenticated and not connected
        this.auth.isAuthenticated() &&
        state !== RxStompState.OPEN
      )
    ),
    { initialValue: false }
  );
}
