import {Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'rxp-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {

  // Access the template from the component
  @ViewChild('searchInput')
  searchInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    // ViewChild is available after the view initializes
    this.searchInput.nativeElement.focus();
  }

  focusInput() {
    this.searchInput.nativeElement.focus();
  }
}
