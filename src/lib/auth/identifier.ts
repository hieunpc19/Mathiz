import "server-only";

import { createHmac } from "node:crypto";

const INTERNAL_AUTH_DOMAIN = "auth.mathiz.invalid";

export function phoneNumberToAuthEmail(phoneNumber: string) {
  const secret = process.env.AUTH_IDENTIFIER_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_IDENTIFIER_SECRET phải có ít nhất 32 ký tự.");
  }

  const identifier = createHmac("sha256", secret)
    .update(phoneNumber, "utf8")
    .digest("hex");

  return `${identifier}@${INTERNAL_AUTH_DOMAIN}`;
}
