import { aggregate, DEMO_WORKER, type Platform } from "./data";
import {
  getOrCreateKeyPair,
  keyFingerprint,
  signPayload,
  verifyPayload,
  type JsonValue,
} from "./crypto";
import type { Connection } from "./store";

export interface CredentialPayload extends Record<string, JsonValue> {
  version: string;
  credentialId: string;
  issuedAt: string;
  expiresAt: string;
  subject: { id: string; name: string; handle: string; city: string };
  summary: {
    overallRating: number;
    totalJobs: number;
    completionRate: number;
    onTimeRate: number;
    connectedPlatforms: number;
    tenureMonths: number;
  };
  platforms: Array<{
    id: string;
    name: string;
    category: string;
    rating: number;
    jobs: number;
    completionRate: number;
    onTimeRate: number;
    dataSource: string;
  }>;
}

const CREDENTIAL_STORAGE_KEY = "gigpass.last-credential.v1";

export interface SignedCredential {
  payload: CredentialPayload;
  proof: {
    type: "ECDSA-P256-SHA256";
    publicKeyJwk: JsonWebKey;
    signature: string;
    keyFingerprint: string;
  };
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function issueCredential(
  platforms: Platform[],
  connections: Connection[],
): Promise<SignedCredential> {
  const stats = aggregate(platforms);
  const now = new Date();
  const expires = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const payload: CredentialPayload = {
    version: "gigpass/1.0",
    credentialId: `gpc_${randomId()}`,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    subject: {
      id: DEMO_WORKER.id,
      name: DEMO_WORKER.name,
      handle: DEMO_WORKER.handle,
      city: DEMO_WORKER.city,
    },
    summary: {
      overallRating: stats.overallRating,
      totalJobs: stats.totalJobs,
      completionRate: stats.completionRate,
      onTimeRate: stats.onTimeRate,
      connectedPlatforms: stats.connectedCount,
      tenureMonths: stats.tenureMonths,
    },
    platforms: platforms.map((p) => {
      const consent = connections.find((c) => c.platformId === p.id)?.consent;
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        rating: consent?.shareRating === false ? 0 : p.metrics.rating,
        jobs: consent?.shareVolume === false ? 0 : p.metrics.jobs,
        completionRate: consent?.shareReliability === false ? 0 : p.metrics.completionRate,
        onTimeRate: consent?.shareReliability === false ? 0 : p.metrics.onTimeRate,
        dataSource: "simulated-platform-sandbox",
      };
    }),
  };

  const keys = await getOrCreateKeyPair();
  const signature = await signPayload(payload as unknown as JsonValue, keys.privateKeyJwk);

  return {
    payload,
    proof: {
      type: "ECDSA-P256-SHA256",
      publicKeyJwk: keys.publicKeyJwk,
      signature,
      keyFingerprint: await keyFingerprint(keys.publicKeyJwk),
    },
  };
}

export type VerificationResult =
  | { status: "valid"; credential: SignedCredential; expired: boolean }
  | { status: "invalid"; reason: string };

export async function verifyCredential(raw: string): Promise<VerificationResult> {
  let parsed: SignedCredential;
  try {
    parsed = JSON.parse(raw) as SignedCredential;
  } catch {
    return { status: "invalid", reason: "The credential is not valid JSON." };
  }

  if (!parsed?.payload || !parsed?.proof?.signature || !parsed?.proof?.publicKeyJwk) {
    return { status: "invalid", reason: "Missing credential payload or cryptographic proof." };
  }
  if (parsed.proof.type !== "ECDSA-P256-SHA256") {
    return { status: "invalid", reason: `Unsupported proof type: ${String(parsed.proof.type)}` };
  }

  let ok = false;
  try {
    ok = await verifyPayload(
      parsed.payload as unknown as JsonValue,
      parsed.proof.signature,
      parsed.proof.publicKeyJwk,
    );
  } catch {
    return { status: "invalid", reason: "Signature or public key could not be processed." };
  }

  if (!ok) {
    return {
      status: "invalid",
      reason: "Signature does not match the payload — this credential was modified.",
    };
  }

  return {
    status: "valid",
    credential: parsed,
    expired: new Date(parsed.payload.expiresAt).getTime() < Date.now(),
  };
}


/** Persist the latest demo credential so it survives page navigation/reloads. */
export function saveCredential(credential: SignedCredential): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credential));
}

export function loadCredential(): SignedCredential | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SignedCredential;
  } catch {
    return null;
  }
}

export function clearCredential(): void {
  if (typeof window !== "undefined") localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
}

export function encodeCredentialForUrl(credential: SignedCredential): string {
  const bytes = new TextEncoder().encode(JSON.stringify(credential));
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodeCredentialFromUrl(value: string): SignedCredential | null {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const json = new TextDecoder().decode(base64ToBytes(padded));
    return JSON.parse(json) as SignedCredential;
  } catch {
    return null;
  }
}
