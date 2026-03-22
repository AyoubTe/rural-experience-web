import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
