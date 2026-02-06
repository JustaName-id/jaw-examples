import { Account } from "@jaw.id/core";
import express, { type Request, type Response } from "express";
import { privateKeyToAccount } from "viem/accounts";
import { encodeFunctionData, parseUnits, type Address, type Hex } from "viem";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const JAW_API_KEY = process.env.JAW_API_KEY;
const SPENDER_PRIVATE_KEY = process.env.SPENDER_PRIVATE_KEY as
  | `0x${string}`
  | undefined;
const PORT = Number(process.env.PORT) || 3001;

// Base mainnet USDC
const USDC_ADDRESS: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;

// Where charged funds are sent
const SERVICE_TREASURY: Address =
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2";

// Base mainnet chain ID
const CHAIN_ID = 8453;

// Minimal ERC-20 transfer ABI fragment
const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build an ERC-20 transfer call object for the given USDC amount. */
function buildTransferCall(amount: string) {
  return {
    to: USDC_ADDRESS,
    data: encodeFunctionData({
      abi: ERC20_TRANSFER_ABI,
      functionName: "transfer",
      args: [SERVICE_TREASURY, parseUnits(amount, USDC_DECIMALS)],
    }),
  };
}

/** Standard JSON error response. */
function errorResponse(res: Response, status: number, message: string) {
  return res.status(status).json({ ok: false, error: message });
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function main() {
  // --- Validate environment ---------------------------------------------------

  if (!JAW_API_KEY) {
    console.error("[boot] Missing JAW_API_KEY. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  if (!SPENDER_PRIVATE_KEY) {
    console.error("[boot] Missing SPENDER_PRIVATE_KEY. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  // --- Initialise the JAW Account ---------------------------------------------

  console.log("[boot] Creating local signer from SPENDER_PRIVATE_KEY...");
  const spenderAccount = privateKeyToAccount(SPENDER_PRIVATE_KEY);
  console.log(`[boot] Spender address: ${spenderAccount.address}`);

  console.log("[boot] Initialising JAW Account (chainId: %d)...", CHAIN_ID);
  const account = await Account.fromLocalAccount(
    { chainId: CHAIN_ID, apiKey: JAW_API_KEY },
    spenderAccount,
  );
  console.log("[boot] JAW Account ready.");

  // --- Express app ------------------------------------------------------------

  const app = express();
  app.use(express.json());

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      spender: spenderAccount.address,
      chainId: CHAIN_ID,
      treasury: SERVICE_TREASURY,
      usdc: USDC_ADDRESS,
    });
  });

  // Estimate gas for a charge
  app.post("/estimate", async (req: Request, res: Response) => {
    try {
      const { permissionId, amount } = req.body;

      if (!permissionId || !amount) {
        return errorResponse(res, 400, "Missing required fields: permissionId, amount");
      }

      console.log(
        "[estimate] permissionId=%s amount=%s USDC",
        permissionId,
        amount,
      );

      const transferCall = buildTransferCall(String(amount));

      const gas = await account.estimateGas([transferCall], {
        permissionId: permissionId as Hex,
      });

      console.log("[estimate] Gas estimate: %s", String(gas));

      return res.json({ ok: true, gas: String(gas) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[estimate] Error:", message);
      return errorResponse(res, 500, message);
    }
  });

  // Execute a charge
  app.post("/charge", async (req: Request, res: Response) => {
    try {
      const { permissionId, amount } = req.body;

      if (!permissionId || !amount) {
        return errorResponse(res, 400, "Missing required fields: permissionId, amount");
      }

      console.log(
        "[charge] permissionId=%s amount=%s USDC",
        permissionId,
        amount,
      );

      const transferCall = buildTransferCall(String(amount));

      const { id } = await account.sendCalls([transferCall], {
        permissionId: permissionId as Hex,
      });

      console.log("[charge] Submitted. batchId=%s", id);

      return res.json({ ok: true, batchId: id });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[charge] Error:", message);
      return errorResponse(res, 500, message);
    }
  });

  // Check transaction status
  app.get("/status/:batchId", async (req: Request, res: Response) => {
    try {
      const { batchId } = req.params;

      if (!batchId) {
        return errorResponse(res, 400, "Missing batchId parameter");
      }

      console.log("[status] batchId=%s", batchId);

      const status = account.getCallStatus(batchId);

      console.log("[status] Result: %o", status);

      return res.json({ ok: true, ...status });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[status] Error:", message);
      return errorResponse(res, 500, message);
    }
  });

  // --- Start listening --------------------------------------------------------

  app.listen(PORT, () => {
    console.log("");
    console.log("  node-server-charge is running");
    console.log("  --------------------------------------------------");
    console.log("  Health:   GET  http://localhost:%d/health", PORT);
    console.log("  Estimate: POST http://localhost:%d/estimate", PORT);
    console.log("  Charge:   POST http://localhost:%d/charge", PORT);
    console.log("  Status:   GET  http://localhost:%d/status/:batchId", PORT);
    console.log("  --------------------------------------------------");
    console.log("");
  });
}

main().catch((err) => {
  console.error("[boot] Fatal error:", err);
  process.exit(1);
});
