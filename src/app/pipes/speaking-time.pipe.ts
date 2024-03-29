import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'speakingTime' })
export class SpeakingTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    if (typeof value !== 'number') {
      return value;
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);

    return `${hours}h ${minutes}m ${seconds}s`;

  }

}
