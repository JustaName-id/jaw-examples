import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function POST(request: Request) {
  const { message, signature } = await request.json();
  const siweMessage = parseSiweMessage(message);

  const isValid = await verifySiweMessage(client, {
    message,
    signature,
  });

  if (!isValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  // In production, create a proper session token (e.g. JWT or iron-session)
  // instead of storing the address directly in a cookie.
  return new Response(
    JSON.stringify({ success: true, address: siweMessage.address }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `siwe_address=${siweMessage.address}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
      },
    }
  );
}
