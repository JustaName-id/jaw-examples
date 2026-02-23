export async function POST() {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie":
        "siwe_address=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    },
  });
}
