const base = 'https://d2zk2bghxwzsug.cloudfront.net';

export const env = {
  awsCloudFrontSessionsRawBaseFolder: `${base}/sessions-raw`,
  awsCloudFrontSessionsConfigsBaseFolder: `${base}/sessions-configs`,
  awsCloudFrontSessionsScanResultsRedactedBaseFolder: `${base}/sessions-scan-results-redacted`,
  awsCloudFrontSessionsSpeakersRedactedBaseFolder: `${base}/sessions-speakers-redacted`,
  awsCloudFrontSessionsSpeechesRedactedBaseFolder: `${base}/sessions-speeches-redacted`,
} as const;
