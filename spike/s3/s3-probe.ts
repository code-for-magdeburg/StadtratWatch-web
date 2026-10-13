import { createHash, randomBytes } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';

const runtime = 'Bun' in globalThis ? 'bun' : 'Deno' in globalThis ? 'deno' : 'node';
const bucket = process.env.AWS_S3_BUCKET!;
const key = `spike/bun-s3-probe/${runtime}-${Date.now()}.bin`;
const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
});

const payload = randomBytes(8 * 1024 * 1024);
const sha256 = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');

async function hashNodeReadable(stream: Readable): Promise<{ hash: string; chunks: number }> {
  const hash = createHash('sha256');
  let chunks = 0;
  for await (const chunk of stream) {
    hash.update(chunk);
    chunks++;
  }
  return { hash: hash.digest('hex'), chunks };
}

async function hashWebStream(stream: ReadableStream<Uint8Array>): Promise<{ hash: string; chunks: number }> {
  const hash = createHash('sha256');
  let chunks = 0;
  const reader = stream.getReader();
  for (let result = await reader.read(); !result.done; result = await reader.read()) {
    hash.update(result.value);
    chunks++;
  }
  return { hash: hash.digest('hex'), chunks };
}

try {
  const putStart = performance.now();
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: payload, ContentType: 'application/octet-stream' }));
  const putMs = Math.round(performance.now() - putStart);

  const getStart = performance.now();
  const asNodeStream = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const nodeStreamResult = await hashNodeReadable(asNodeStream.Body as Readable);
  const getMs = Math.round(performance.now() - getStart);

  const asWebStream = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const webStreamResult = await hashWebStream(asWebStream.Body!.transformToWebStream());

  const expected = sha256(payload);
  console.log(JSON.stringify({
    runtime,
    bytes: payload.length,
    putMs,
    getMs,
    nodeStreamMatches: nodeStreamResult.hash === expected,
    nodeStreamChunks: nodeStreamResult.chunks,
    webStreamMatches: webStreamResult.hash === expected,
    webStreamChunks: webStreamResult.chunks,
  }));
} finally {
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    console.log(JSON.stringify({ runtime, cleanup: 'failed', key, reason: (error as Error).name }));
  }
}
