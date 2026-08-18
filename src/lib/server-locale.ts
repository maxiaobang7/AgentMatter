import "server-only";

import { headers } from "next/headers";
import { DEFAULT_LOCALE, isPublicLocale, type PublicLocale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<PublicLocale> {
  const value = (await headers()).get("x-agentmatter-locale");
  return isPublicLocale(value) ? value : DEFAULT_LOCALE;
}
