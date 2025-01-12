export function convertVideoTimestampToSeconds(videoTimestamp: string): number {

  const timeParts = videoTimestamp.split(':');
  switch (timeParts.length) {
    case 1:
      return parseInt(timeParts[0] || '0');
    case 2:
      return parseInt(timeParts[0] || '0') * 60 + parseInt(timeParts[1] || '0');
    case 3:
      return parseInt(timeParts[0] || '0') * 3600 + parseInt(timeParts[1] || '0') * 60 + parseInt(timeParts[2] || '0');
    default:
      return 0;
  }

}
