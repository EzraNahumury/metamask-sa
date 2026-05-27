import express, { type Request, type Response, type Router } from "express";
import { randomUUID } from "node:crypto";
import { catalog, getServiceOr404 } from "./catalog.js";
import { config } from "./config.js";
import { build402Body, decodeX402Header, verifyX402Payment } from "./x402.js";

let anomalyArmedFor: string | null = null;
let lastQuoteAmountBySlug = new Map<string, bigint>();

export function buildRouter(): Router {
  const r = express.Router();
  r.use(express.json({ limit: "256kb" }));

  r.get("/", (_req, res) => {
    res.json({
      service: "delegate-merchants",
      recipient: config.MERCHANT_RECIPIENT,
      services: catalog.map(({ slug, displayName, normalPriceMicroUsdc }) => ({
        slug,
        displayName,
        normalPriceMicroUsdc: normalPriceMicroUsdc.toString(),
      })),
      anomalyArmedFor,
    });
  });

  /**
   * Arm the next /quote for a given service to return an inflated price.
   * Used by the demo "anomaly catch" moment so the agent visibly refuses.
   */
  r.post("/admin/arm-anomaly/:slug", (req: Request, res: Response) => {
    const svc = getServiceOr404(String(req.params.slug));
    if (!svc) return res.status(404).json({ error: "unknown service" });
    anomalyArmedFor = svc.slug;
    return res.json({ armed: svc.slug });
  });

  r.get("/:slug/quote", (req: Request, res: Response) => {
    const svc = getServiceOr404(String(req.params.slug));
    if (!svc) return res.status(404).json({ error: "unknown service" });

    const amount =
      anomalyArmedFor === svc.slug
        ? svc.normalPriceMicroUsdc * 32n
        : svc.normalPriceMicroUsdc;
    if (anomalyArmedFor === svc.slug) anomalyArmedFor = null;

    lastQuoteAmountBySlug.set(svc.slug, amount);

    const body = build402Body({
      amount,
      payTo: config.MERCHANT_RECIPIENT as `0x${string}`,
      asset: svc.asset,
    });
    return res.status(402).json(body);
  });

  r.post("/:slug/charge", async (req: Request, res: Response) => {
    const svc = getServiceOr404(String(req.params.slug));
    if (!svc) return res.status(404).json({ error: "unknown service" });

    const payment = decodeX402Header(req.header("x-402-payment") ?? undefined);
    if (!payment) {
      const amount = lastQuoteAmountBySlug.get(svc.slug) ?? svc.normalPriceMicroUsdc;
      return res
        .status(402)
        .json(build402Body({ amount, payTo: config.MERCHANT_RECIPIENT as `0x${string}`, asset: svc.asset }));
    }

    const expectedAmount = lastQuoteAmountBySlug.get(svc.slug) ?? svc.normalPriceMicroUsdc;
    const result = await verifyX402Payment({
      payment,
      expectedTo: config.MERCHANT_RECIPIENT as `0x${string}`,
      expectedAmount,
    });

    if (!result.ok) {
      return res.status(402).json({ error: "payment_invalid", reason: result.reason });
    }

    const receiptId = randomUUID();
    return res.json({
      service: svc.slug,
      receiptId,
      paidBy: result.from,
      paidTo: result.to,
      amountMicroUsdc: result.value.toString(),
      issuedAt: new Date().toISOString(),
      note:
        "MOCK SERVICE — this receipt does not perform an onchain transfer. " +
        "Day-3 wiring will hand the signed authorization to a 1Shot relayer for settlement.",
    });
  });

  return r;
}
