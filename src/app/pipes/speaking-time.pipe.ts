import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'speakingTime' })
export class SpeakingTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    const [unit, hideZeroHours] = args as [string, boolean];

    if (typeof value !== 'number') {
      return value;
    }

    const roundedValue = Math.round(value / 10) * 10;
    const hours = Math.floor(roundedValue / 3600);
    const minutes = Math.floor((roundedValue % 3600) / 60);
    const seconds = Math.floor(roundedValue % 60);

    let result = '';

    if ((!unit || unit.includes('h')) && (!hideZeroHours || hours > 0)) {
      result += ` ${hours}h`;
    }

    if (!unit || unit.includes('m')) {
      result += ` ${minutes}m`;
    }

    if (!unit || unit.includes('s')) {
      result += ` ${seconds}s`;
    }

    return result.trim();

  }

}
