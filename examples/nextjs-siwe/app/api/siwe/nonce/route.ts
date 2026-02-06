import { generateSiweNonce } from "viem/siwe";

export async function GET() {
  const nonce = generateSiweNonce();

  // In production, store the nonce in a server-side session or cache
  // and validate it during verification to prevent replay attacks.
  return Response.json({ nonce });
}
