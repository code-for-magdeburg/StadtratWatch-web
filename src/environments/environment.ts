import { Environment } from '../app/model/Environment';


export const environment: Environment = {
  production: true,
  availableElectoralPeriods: [
    {
      slug: 'magdeburg-7',
      name: 'Wahlperiode VII'
    },
    {
      slug: 'magdeburg-8',
      name: 'Wahlperiode VIII'
    }
  ],
  currentElectoralPeriod: 'magdeburg-8',
  awsCloudFrontBaseUrl: 'https://d2zk2bghxwzsug.cloudfront.net',

  typesense: {
    apiKey: '2AEttw4Bl02tP1nicsVTmtdGWdgMVMKB',
    host: 'typesense.unser-magdeburg.de',
    port: 443,
    protocol: 'https'
  }

};
