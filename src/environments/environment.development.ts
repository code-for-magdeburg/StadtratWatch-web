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
    apiKey: 'XqzCIvWjW8CJVRHKJ2H2ddIAk1rd2Awi',
    host: 'localhost',
    port: 8108,
    protocol: 'http'
  }

};
