export const CHAIN_ID = 84532; // Base Sepolia

export function getEnv() {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const privyAppSecret = process.env.PRIVY_APP_SECRET;
  const jawApiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!privyAppId || !privyAppSecret || !jawApiKey) {
    console.error('Missing required environment variables:');
    if (!privyAppId) console.error('  NEXT_PUBLIC_PRIVY_APP_ID');
    if (!privyAppSecret) console.error('  PRIVY_APP_SECRET');
    if (!jawApiKey) console.error('  NEXT_PUBLIC_API_KEY');
    process.exit(1);
  }

  return { privyAppId, privyAppSecret, jawApiKey };
}
