import { Environment } from '../app/model/Environment';


export const environment: Environment = {
  production: false,
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
    apiKey: 'DdK1Vp86fUTRyGXvBf2MNKnXwWJ3aN7u',
    host: 'localhost',
    port: 8108,
    protocol: 'http'
  }

};
