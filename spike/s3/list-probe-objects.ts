import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({ region: process.env.AWS_REGION });
const listing = await client.send(
  new ListObjectsV2Command({ Bucket: process.env.AWS_S3_BUCKET, Prefix: 'spike/bun-s3-probe/' }),
);
console.log(JSON.stringify((listing.Contents ?? []).map(({ Key, Size }) => ({ Key, Size }))));
