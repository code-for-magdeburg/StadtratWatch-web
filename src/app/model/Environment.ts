export type Environment = {
    production: boolean;
    availableElectoralPeriods: ElectoralPeriod[];
    currentElectoralPeriod: string;
    awsCloudFrontBaseUrl: string;
};


export type ElectoralPeriod = {
    slug: string;
    name: string;
};
