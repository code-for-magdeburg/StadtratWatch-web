import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'speakingTime' })
export class SpeakingTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    const [unit] = args as [string];

    if (typeof value !== 'number') {
      return value;
    }

    const roundedValue = Math.round(value / 10) * 10;
    const hours = Math.floor(roundedValue / 3600);
    const minutes = Math.floor((roundedValue % 3600) / 60);
    const seconds = Math.floor(roundedValue % 60);

    if (unit === 'h') {
      return `${hours}h`;
    }

    if (unit === 'm') {
      return `${hours}h ${minutes}m`;
    }

    return `${hours}h ${minutes}m ${seconds}s`;

  }

}
