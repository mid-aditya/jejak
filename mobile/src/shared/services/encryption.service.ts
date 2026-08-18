import CryptoJS from "crypto-js";
import { MMKV } from "react-native-mmkv";

const STORAGE_KEY = "jejak_encryption";
const storage = new MMKV({ id: "encryption-storage" });

class EncryptionService {
  private encryptionKey: string | null = null;
  private readonly KEY_SIZE = 256;
  private readonly ITERATIONS = 10000;

  // ── Key Management ───────────────────────────────────────────────────────────
  async getOrCreateKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    // Try to load from storage
    const storedKey = storage.getString(STORAGE_KEY);
    if (storedKey) {
      this.encryptionKey = storedKey;
      return storedKey;
    }

    // Generate new key
    const newKey = this.generateKey();
    this.encryptionKey = newKey;
    storage.set(STORAGE_KEY, newKey);
    console.log("[Encryption] Generated new encryption key");
    return newKey;
  }

  // Hermes has no native crypto module, which makes CryptoJS's
  // WordArray.random() throw. Fall back to Math.random-based bytes.
  //
  // NOTE: `length` is a BYTE count (same as WordArray.random). The fallback
  // must pack the bytes into 32-bit words with sigBytes = length — passing
  // the byte array straight to WordArray.create() would treat each byte as a
  // full word (sigBytes = length * 4), inflating salt/iv and breaking the
  // AES-256-CBC key derivation against the backend's EVP_BytesToKey
  // (CryptoJS derives from the oversized salt, backend reads only 8 bytes).
  private randomWords(length: number): CryptoJS.lib.WordArray {
    try {
      return CryptoJS.lib.WordArray.random(length);
    } catch {
      const bytes: number[] = [];
      for (let i = 0; i < length; i++) {
        bytes.push(Math.floor(Math.random() * 256));
      }
      const words: number[] = [];
      for (let i = 0; i < length; i += 4) {
        words.push(
          ((bytes[i] ?? 0) << 24) |
            ((bytes[i + 1] ?? 0) << 16) |
            ((bytes[i + 2] ?? 0) << 8) |
            (bytes[i + 3] ?? 0),
        );
      }
      return CryptoJS.lib.WordArray.create(words, length);
    }
  }

  private generateKey(): string {
    return this.randomWords(32).toString(CryptoJS.enc.Hex);
  }

  // Derive key from password (for data at rest)
  deriveKeyFromPassword(password: string, salt: string): string {
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: this.KEY_SIZE / 32,
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    });
    return key.toString(CryptoJS.enc.Hex);
  }

  // ── Encryption ────────────────────────────────────────────────────────────────
  encryptData(data: string, key?: string): string {
    const encryptionKey = key || this.encryptionKey || "default-key";
    const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      keySize: this.KEY_SIZE / 32,
      // Explicit salt + iv avoid CryptoJS's internal WordArray.random() calls,
      // which throw on Hermes. They are embedded in the output so decryptData
      // can recover them from the ciphertext string.
      salt: this.randomWords(8),
      iv: this.randomWords(16),
    });
    return encrypted.toString();
  }

  decryptData(encryptedData: string, key?: string): string {
    const encryptionKey = key || this.encryptionKey || "default-key";
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        keySize: this.KEY_SIZE / 32,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("[Encryption] Decryption failed:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  // Encrypt JSON object
  encryptJSON<T>(data: T, key?: string): string {
    const jsonString = JSON.stringify(data);
    return this.encryptData(jsonString, key);
  }

  // Decrypt to JSON object
  decryptJSON<T>(encryptedData: string, key?: string): T {
    const jsonString = this.decryptData(encryptedData, key);
    return JSON.parse(jsonString) as T;
  }

  // ── Hashing ──────────────────────────────────────────────────────────────────
  hashData(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  hashPassword(
    password: string,
    salt?: string,
  ): { hash: string; salt: string } {
    const useSalt = salt || CryptoJS.lib.WordArray.random(16).toString();
    const hash = CryptoJS.PBKDF2(password, useSalt, {
      keySize: this.KEY_SIZE / 32,
      iterations: this.ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    }).toString(CryptoJS.enc.Hex);
    return { hash, salt: useSalt };
  }

  verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }

  // ── Location Data Encryption ───────────────────────────────────────────────────
  encryptLocation(location: {
    latitude: number;
    longitude: number;
    altitude?: number;
  }): string {
    return this.encryptJSON(location);
  }

  decryptLocation(encrypted: string): {
    latitude: number;
    longitude: number;
    altitude?: number;
  } {
    return this.decryptJSON(encrypted);
  }

  // ── Medical Info Encryption ───────────────────────────────────────────────────
  encryptMedicalInfo(medicalInfo: Record<string, any>): string {
    return this.encryptJSON(medicalInfo);
  }

  decryptMedicalInfo<T>(encrypted: string): T {
    return this.decryptJSON<T>(encrypted);
  }

  // ── Secure Storage ───────────────────────────────────────────────────────────
  encryptAndStore(key: string, data: any): void {
    const encrypted = this.encryptJSON(data);
    storage.set(`secure_${key}`, encrypted);
  }

  retrieveAndDecrypt<T>(key: string): T | null {
    const encrypted = storage.getString(`secure_${key}`);
    if (!encrypted) return null;
    return this.decryptJSON<T>(encrypted);
  }

  removeSecure(key: string): void {
    storage.delete(`secure_${key}`);
  }

  // ── Utility ─────────────────────────────────────────────────────────────────
  clearKey(): void {
    this.encryptionKey = null;
    storage.delete(STORAGE_KEY);
  }

  hasKey(): boolean {
    return this.encryptionKey !== null || storage.contains(STORAGE_KEY);
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;
