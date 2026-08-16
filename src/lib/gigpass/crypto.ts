/**
 * Client-side credential signing using the Web Crypto API (ECDSA P-256 / SHA-256).
 *
 * The worker's key pair is generated in the browser and stored locally, so the
 * worker owns their signing key. When a real backend (Lovable Cloud / Supabase)
 * is connected, only the storage layer below needs to change — the signing and
 * verification helpers stay identical.
 */

const KEY_STORAGE = "gigpass.keypair.v1";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

/** Deterministic JSON serialization so signatures are reproducible. */
export function canonicalize(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k] as JsonValue)}`).join(",")}}`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

const ALGO = { name: "ECDSA", namedCurve: "P-256" } as const;
const SIGN_PARAMS = { name: "ECDSA", hash: "SHA-256" } as const;

export interface StoredKeyPair {
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
}

export async function getOrCreateKeyPair(): Promise<StoredKeyPair> {
  const existing = localStorage.getItem(KEY_STORAGE);
  if (existing) {
    try {
      return JSON.parse(existing) as StoredKeyPair;
    } catch {
      /* regenerate below */
    }
  }
  const pair = await crypto.subtle.generateKey(ALGO, true, ["sign", "verify"]);
  const stored: StoredKeyPair = {
    publicKeyJwk: await crypto.subtle.exportKey("jwk", pair.publicKey),
    privateKeyJwk: await crypto.subtle.exportKey("jwk", pair.privateKey),
  };
  localStorage.setItem(KEY_STORAGE, JSON.stringify(stored));
  return stored;
}

export async function signPayload(
  payload: JsonValue,
  privateKeyJwk: JsonWebKey,
): Promise<string> {
  const key = await crypto.subtle.importKey("jwk", privateKeyJwk, ALGO, false, ["sign"]);
  const data = new Uint8Array(new TextEncoder().encode(canonicalize(payload)));
  const sig = await crypto.subtle.sign(SIGN_PARAMS, key, data);
  return bytesToBase64(new Uint8Array(sig));
}

export async function verifyPayload(
  payload: JsonValue,
  signatureB64: string,
  publicKeyJwk: JsonWebKey,
): Promise<boolean> {
  const key = await crypto.subtle.importKey("jwk", publicKeyJwk, ALGO, false, ["verify"]);
  const data = new Uint8Array(new TextEncoder().encode(canonicalize(payload)));
  return crypto.subtle.verify(SIGN_PARAMS, key, base64ToBytes(signatureB64), data);
}

/** Short human-readable fingerprint of a public key. */
export async function keyFingerprint(publicKeyJwk: JsonWebKey): Promise<string> {
  const data = new Uint8Array(new TextEncoder().encode(canonicalize(publicKeyJwk as unknown as JsonValue)));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
