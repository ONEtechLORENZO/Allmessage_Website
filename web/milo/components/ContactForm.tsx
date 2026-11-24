"use client";

import Link from "next/link";
import { useActionState } from "react";
import { sendContact, type ContactField, type ContactState } from "@milo/actions/contact";
import type { Dictionary } from "@milo/lib/dictionaries";
import { localePath, type Locale } from "@milo/lib/site";

const initial: ContactState = { status: "idle" };

export function ContactForm({ lang, t }: { lang: Locale; t: Dictionary["contact"] }) {
  const [state, action, pending] = useActionState(sendContact, initial);
  const has = (f: ContactField) => state.errors?.includes(f) ?? false;

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-xl border border-success p-6 text-center font-medium text-success">
        {t.success}
      </p>
    );
  }

  const input =
    "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground aria-[invalid=true]:border-danger";

  return (
    <form action={action} noValidate className="space-y-5">
      {/* Honeypot field, hidden from people and screen readers */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium">
          {t.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={has("name")}
          aria-describedby={has("name") ? "name-error" : undefined}
          className={input}
        />
        {has("name") && <p id="name-error" className="mt-1 text-sm text-danger">{t.errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={has("email")}
          aria-describedby={has("email") ? "email-error" : undefined}
          className={input}
        />
        {has("email") && <p id="email-error" className="mt-1 text-sm text-danger">{t.errors.email}</p>}
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          aria-invalid={has("message")}
          aria-describedby={has("message") ? "message-error" : undefined}
          className={input}
        />
        {has("message") && <p id="message-error" className="mt-1 text-sm text-danger">{t.errors.message}</p>}
      </div>

      <div>
        {/* Consent box is never pre-ticked (GDPR) */}
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={has("consent")}
            aria-describedby={has("consent") ? "consent-error" : undefined}
            className="mt-1 h-4 w-4 accent-[var(--brand)]"
          />
          <label htmlFor="consent" className="text-sm text-muted">
            {t.consent}{" "}
            (<Link href={localePath(lang, "/privacy")} className="text-foreground underline" target="_blank">
              {t.privacyLink}
            </Link>)
          </label>
        </div>
        {has("consent") && <p id="consent-error" className="mt-1 text-sm text-danger">{t.errors.consent}</p>}
      </div>

      {state.serverError && (
        <p role="alert" className="text-sm text-danger">
          {t.errors.server}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-5 py-3 font-semibold text-brand-contrast hover:bg-brand-strong disabled:opacity-60 sm:w-auto"
      >
        {pending ? t.sending : t.submit}
      </button>
      <p aria-live="polite" className="sr-only">{pending ? t.sending : ""}</p>
    </form>
  );
}
