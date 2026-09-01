import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key() {
  const secret = process.env.AUTH_IDENTIFIER_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_IDENTIFIER_SECRET phải có ít nhất 32 ký tự.");
  }
  return createHash("sha256").update(`mathiz-exam-answer:${secret}`).digest();
}

export function encryptAnswer(answer: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(answer, "utf8"), cipher.final()]);
  return [
    "enc",
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptAnswer(value: string) {
  const [prefix, version, iv, tag, encrypted] = value.split(":");
  if (prefix !== "enc" || version !== "v1" || !iv || !tag || !encrypted) {
    throw new Error("Đáp án trong database chưa được mã hóa đúng định dạng.");
  }
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
