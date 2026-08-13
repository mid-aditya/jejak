import { Request, Response, NextFunction } from "express";
import { createDecipheriv, createHash } from "crypto";

// Fields that the mobile app encrypts client-side before sending
// (see mobile/src/shared/services/api-client.ts). The decrypted value keeps
// the original JSON shape (string / object / array).
const SENSITIVE_FIELDS = ["password", "emergencyContacts", "medicalInfo", "location"];

const KEY_LEN = 32; // AES-256
const IV_LEN = 16;

/**
 * CryptoJS-compatible key derivation (EVP_BytesToKey with MD5), matching the
 * OpenSSL "Salted__" ciphertext format produced by CryptoJS.AES.encrypt when a
 * passphrase string is used.
 */
function evpBytesToKey(
  password: Buffer,
  salt: Buffer,
  keyLen: number,
  ivLen: number,
): { key: Buffer; iv: Buffer } {
  const derived = Buffer.alloc(keyLen + ivLen);
  let previous = Buffer.alloc(0);
  let written = 0;

  while (written < derived.length) {
    const hash = createHash("md5");
    hash.update(previous);
    hash.update(password);
    hash.update(salt);
    previous = hash.digest();
    previous.copy(derived, written);
    written += previous.length;
  }

  return {
    key: derived.subarray(0, keyLen),
    iv: derived.subarray(keyLen, keyLen + ivLen),
  };
}

/** Decrypt a CryptoJS/OpenSSL formatted AES-256-CBC payload. */
export function decryptCryptoJSAES(encryptedBase64: string, passphrase: string): string {
  const raw = Buffer.from(encryptedBase64, "base64");
  if (raw.length < 16 || raw.subarray(0, 8).toString("latin1") !== "Salted__") {
    throw new Error("Invalid encrypted payload format");
  }

  const salt = raw.subarray(8, 16);
  const ciphertext = raw.subarray(16);
  const { key, iv } = evpBytesToKey(Buffer.from(passphrase, "utf8"), salt, KEY_LEN, IV_LEN);

  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/**
 * Global middleware: restores plaintext values for fields the mobile app
 * encrypts client-side. The passphrase travels in the `X-Encryption-Key`
 * header (over TLS). If the header is missing or a field isn't encrypted,
 * the body is left untouched so plaintext clients keep working.
 */
export function decryptRequestBody(req: Request, _res: Response, next: NextFunction) {
  try {
    const passphrase = req.headers["x-encryption-key"];
    const body = req.body;

    if (
      typeof passphrase === "string" &&
      passphrase.length > 0 &&
      body &&
      typeof body === "object" &&
      !Array.isArray(body)
    ) {
      for (const field of SENSITIVE_FIELDS) {
        const value = body[field];
        if (typeof value === "string") {
          try {
            body[field] = JSON.parse(decryptCryptoJSAES(value, passphrase));
          } catch {
            // Not encrypted (or wrong key) — keep the original value.
          }
        }
      }
    }
  } catch {
    // Never block a request because of decryption issues.
  }

  next();
}
