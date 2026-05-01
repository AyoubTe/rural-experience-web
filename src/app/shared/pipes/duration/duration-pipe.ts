import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transform a number of days into a human-readable duration string.
 * Examples:
 *    1 ->  "1 day"
 *    3 ->  "3 days"
 *    6 ->  "6 days"
 *    7 ->  "1 week"
 *    14 -> "2 weeks"
 *    30 -> "1 month"
 * @param n
 */

@Pipe({
  name: 'duration',
  standalone: true,
  pure: true // recalculates when input changes
})
export class DurationPipe implements PipeTransform {

  transform(days: number, format: 'short' | 'long' = 'long'): string {
    if (days <= 0) return '-';

    if (days === 1) {
      return format === 'short' ? `1d` : `1 day`;
    }

    if (days < 7) {
      return format === 'short' ? `${days}d` : `${days} days`;
    }

    if (days === 7) {
      return format === 'short' ? `1w` : `1 week`;
    }

    const weeks = Math.floor(days / 7);
    const remainingDays = weeks % 7;

    if (remainingDays === 0) {
      const label =  weeks === 1 ? 'week' : 'weeks';

      return format === 'short'
        ? `${weeks}w`
        : `${weeks} ${label}`;
    }

    const weekLabel =  weeks === 1 ? 'week' : 'weeks';
    const dayLabel = remainingDays === 1 ? 'day' : 'days';
    return format === 'short'
      ? `${weeks}w ${dayLabel}d`
      : `${weeks} ${weekLabel} ${remainingDays} ${dayLabel}`;
  }
}
