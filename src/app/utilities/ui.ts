
export const ACCEPTED_COLOR = 'rgb(0,150,0)';
export const PARTIALLY_ACCEPTED_COLOR = 'rgb(255,180,65)';
export const REJECTED_COLOR = 'rgb(220,0,0)';

export const VOTED_FOR_COLOR = ACCEPTED_COLOR;
export const VOTED_AGAINST_COLOR = REJECTED_COLOR;
export const VOTED_ABSTENTION_COLOR = 'rgb(255,180,65)';
export const DID_NOT_VOTE_COLOR = 'rgb(200,200,200)';


export function formatFileSize(size: number): string {

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let fileSize = size;
  while (fileSize >= 1024 && unitIndex < units.length) {
    fileSize /= 1024;
    unitIndex++;
  }

  return `${fileSize.toFixed(2)} ${units[unitIndex]}`;

}
