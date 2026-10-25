import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** `Date` → "hace 3 días". Pure: recalculated only when the input date changes. */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(date: Date, now: Date = new Date()): string {
    const seconds = Math.round((date.getTime() - now.getTime()) / 1000);

    for (const [unit, unitSeconds] of UNITS) {
      if (Math.abs(seconds) >= unitSeconds) {
        return formatter.format(Math.round(seconds / unitSeconds), unit);
      }
    }
    return formatter.format(0, 'minute');
  }
}
