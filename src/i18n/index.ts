/**
 * i18n helpers used by both the Astro server-rendered components and the
 * Preact island. Two entry points:
 *
 *   - `getLocale(url)` — derive the active locale from a URL pathname.
 *   - `useT(locale)` — return a `t(key)` function for that locale.
 *
 * Astro components call them at render time; the Generator Preact island
 * receives a pre-built `t` function as a prop so it doesn't need to know
 * about the current URL.
 */
import { DEFAULT_LOCALE, type Locale, STRINGS, type StringKey } from "./translations.js";

export function getLocale(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  // The Astro base ("/website") is already stripped from Astro.url.pathname
  // but we strip it defensively in case this helper is called with a raw URL.
  const stripped = pathname.replace(/^\/website/, "");
  if (stripped.startsWith("/fr")) return "fr";
  return DEFAULT_LOCALE;
}

export type Translator = (key: StringKey, vars?: Record<string, string>) => string;

export function useT(locale: Locale): Translator {
  return (key, vars) => {
    const entry = STRINGS[key];
    let template = entry[locale];
    if (vars !== undefined) {
      for (const [varKey, varValue] of Object.entries(vars)) {
        template = template.replaceAll(`$${varKey.toUpperCase()}$`, varValue);
      }
    }
    return template;
  };
}

export interface LocalePath {
  /** Path prefix for the current locale ("" for English, "/fr" for French). */
  prefix: string;
  /** Build a path under the active locale. `to("/try")` → "/try" or "/fr/try". */
  to: (path: string) => string;
}

/** Path helper for the active locale. Useful in links to keep them localised. */
export function pathHelper(locale: Locale): LocalePath {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return {
    prefix,
    to: (path: string) => `${prefix}${path.startsWith("/") ? path : `/${path}`}`,
  };
}
