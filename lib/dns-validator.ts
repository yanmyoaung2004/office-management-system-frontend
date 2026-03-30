"use server";
import { promises as dns } from "node:dns";

export async function isValidEmailDomain(email: string): Promise<boolean> {
  const domain = email.split("@")[1];

  if (!domain) return false;

  try {
    const addresses = await dns.resolveMx(domain);
    return addresses.length > 0;
  } catch {
    return false;
  }
}
