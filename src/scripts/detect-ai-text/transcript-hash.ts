import { encodeHex } from '@std/encoding/hex';

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return encodeHex(digest);
}
