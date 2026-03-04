import { Pipe, PipeTransform } from '@angular/core';

/***
 * Truncate the long descriptions on card views
 */
@Pipe({
  name: 'truncatePipe',
  standalone: true,
  pure: true
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, maxLength = 120, suffix = '....'): string {
    if (value.length === 0) return '';
    if (value.length < maxLength) return value;

    const truncated = value.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.slice(0, lastSpace) + suffix;
  }
}
