export const CHAIN_ID = 84532; // Base Sepolia

export function getEnv() {
  const turnkeyOrgId = process.env.TURNKEY_ORGANIZATION_ID;
  const turnkeyApiPublicKey = process.env.TURNKEY_API_PUBLIC_KEY;
  const turnkeyApiPrivateKey = process.env.TURNKEY_API_PRIVATE_KEY;
  const jawApiKey = process.env.JAW_API_KEY;

  if (!turnkeyOrgId || !turnkeyApiPublicKey || !turnkeyApiPrivateKey || !jawApiKey) {
    console.error('Missing required environment variables:');
    if (!turnkeyOrgId) console.error('  TURNKEY_ORGANIZATION_ID');
    if (!turnkeyApiPublicKey) console.error('  TURNKEY_API_PUBLIC_KEY');
    if (!turnkeyApiPrivateKey) console.error('  TURNKEY_API_PRIVATE_KEY');
    if (!jawApiKey) console.error('  JAW_API_KEY');
    process.exit(1);
  }

  return { turnkeyOrgId, turnkeyApiPublicKey, turnkeyApiPrivateKey, jawApiKey };
}
