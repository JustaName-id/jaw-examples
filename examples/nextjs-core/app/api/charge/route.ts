import { Account } from "@jaw.id/core";
import { privateKeyToAccount } from "viem/accounts";
import { encodeFunctionData, parseUnits } from "viem";
import { USDC_ADDRESS, SERVICE_TREASURY, TRANSFER_ABI } from "@/lib/constants";

export async function POST(request: Request) {
  const { permissionId, amount } = await request.json();

  const spenderAccount = privateKeyToAccount(
    process.env.SPENDER_PRIVATE_KEY as `0x${string}`
  );

  const account = await Account.fromLocalAccount(
    { chainId: 8453, apiKey: process.env.JAW_API_KEY! },
    spenderAccount
  );

  const { id } = await account.sendCalls(
    [
      {
        to: USDC_ADDRESS,
        data: encodeFunctionData({
          abi: TRANSFER_ABI,
          functionName: "transfer",
          args: [SERVICE_TREASURY, parseUnits(amount, 6)],
        }),
      },
    ],
    { permissionId: permissionId as `0x${string}` }
  );

  return Response.json({ success: true, transactionId: id });
}
