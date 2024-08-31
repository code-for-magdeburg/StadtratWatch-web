export type Environment = {
  production: boolean;
  availableElectoralPeriods: ElectoralPeriod[];
  currentElectoralPeriod: string;
  awsCloudFrontBaseUrl: string;
  typesense: TypesenseConfig;
};


export type ElectoralPeriod = {
  slug: string;
  name: string;
};


export type TypesenseConfig = {
  apiKey: string;
  host: string;
  port: number;
  protocol: string;
};
