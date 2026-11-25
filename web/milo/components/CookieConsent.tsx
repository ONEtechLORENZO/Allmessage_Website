"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { localePath, type Locale } from "@milo/lib/site";

// GDPR / Italian Garante rules followed here:
// - no analytics cookies before consent; "Reject" is as visible as "Accept"; closing the banner = reject
// - the choice is remembered for 6 months, then asked again; it can be changed any time from the footer.

type Consent = "granted" | "denied";
const COOKIE = "consent";
const MAX_AGE = 60 * 60 * 24 * 180; // 6 months
const OPEN_EVENT = "open-cookie-settings";

function readConsent(): Consent | null {
  const match = document.cookie.match(/(?:^|;\s*)consent=(granted|denied)/);
  return (match?.[1] as Consent) ?? null;
}

function writeConsent(value: Consent) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function deleteAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
    }
  }
}

type BannerText = { title: string; text: string; accept: string; reject: string; more: string };

// Tiny store so React re-reads the cookie after it changes.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
// On the server the choice is unknown, so nothing is rendered there.
const serverSnapshot = () => "unknown" as const;

export function CookieConsent({ lang, text, gaId }: { lang: Locale; text: BannerText; gaId: string }) {
  const consent = useSyncExternalStore(subscribe, readConsent, serverSnapshot);
  const [reopened, setReopened] = useState(false);
  const open = consent === null || reopened;

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  function choose(value: Consent) {
    const wasGranted = consent === "granted";
    writeConsent(value);
    listeners.forEach((l) => l());
    setReopened(false);
    if (value === "denied" && wasGranted) {
      deleteAnalyticsCookies();
      location.reload(); // unloads the analytics script
    }
  }

  return (
    <>
      {consent === "granted" && /^G-[A-Z0-9]+$/.test(gaId) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}

      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-text"
          className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-2xl rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-6"
        >
          <button
            type="button"
            onClick={() => choose("denied")}
            aria-label={text.reject}
            className="absolute right-2 top-2 rounded-md p-2.5 text-muted hover:text-foreground"
          >
            <span aria-hidden="true">✕</span>
          </button>
          <h2 id="cookie-title" className="pr-8 text-base font-semibold">
            {text.title}
          </h2>
          <p id="cookie-text" className="mt-2 text-sm text-muted">
            {text.text}{" "}
            <Link href={localePath(lang, "/cookie-policy")} className="font-medium text-foreground underline">
              {text.more}
            </Link>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => choose("denied")}
              className="rounded-lg border-2 border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-surface"
            >
              {text.reject}
            </button>
            <button
              type="button"
              onClick={() => choose("granted")}
              className="rounded-lg border-2 border-brand bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-strong"
            >
              {text.accept}
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export function CookieSettingsButton({ label, className = "hover:text-foreground" }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={className}
    >
      {label}
    </button>
  );
}
