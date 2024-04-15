import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'youtubeTimestamp'
})
export class YoutubeTimestampPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    const timestamp = Math.round(value as number);

    const hours = Math.floor(timestamp / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((timestamp % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(timestamp % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;

  }

}
