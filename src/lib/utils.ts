import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function decodeJwtPayload(token: string): any | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const json = Buffer.from(payloadPart, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}