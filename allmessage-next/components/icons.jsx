// Brand and plan-tier icons shared across sections.

export function GmailIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7c1.657 0 3-1.343 3-3V16.2z" /><path fill="#1e88e5" d="M3 16.2l3.614 1.71L13 23.7V40H6c-1.657 0-3-1.343-3-3V16.2z" /><path fill="#e53935" d="M35 11.2L24 19.45 13 11.2 12 17l1 6.7 11 8.25 11-8.25 1-6.7z" /><path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859A4.298 4.298 0 0 0 7.298 8C4.924 8 3 9.924 3 12.298z" /><path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341A4.298 4.298 0 0 1 40.702 8C43.076 8 45 9.924 45 12.298z" /></svg>;
}

export function WhatsAppIcon() {
  return <svg viewBox="-2 -2 28 28" aria-hidden="true"><circle cx="12" cy="11.9" r="13" fill="#25d366" /><path fill="#25d366" d="M-1.6 25.6 1 16.5 8.5 23z" /><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>;
}

export function InstagramIcon({ gradientId = 'instagram-grad' }) {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><defs><radialGradient id={gradientId} cx="30%" cy="107%" r="150%"><stop offset="0" stopColor="#fdf497" /><stop offset=".05" stopColor="#fdf497" /><stop offset=".45" stopColor="#fd5949" /><stop offset=".6" stopColor="#d6249f" /><stop offset=".9" stopColor="#285aeb" /></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradientId})`} /><rect x="10.5" y="10.5" width="27" height="27" rx="8" fill="none" stroke="#fff" strokeWidth="3.4" /><circle cx="24" cy="24" r="6.6" fill="none" stroke="#fff" strokeWidth="3.4" /><circle cx="32.2" cy="15.8" r="2" fill="#fff" /></svg>;
}

export function FacebookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0866ff" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z" /></svg>;
}

export function MessengerIcon({ gradientId = 'messenger-grad' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id={gradientId} cx="19%" cy="99%" r="109%"><stop offset="0" stopColor="#0099ff" /><stop offset=".61" stopColor="#a033ff" /><stop offset=".93" stopColor="#ff5280" /><stop offset="1" stopColor="#ff7061" /></radialGradient></defs><path fill={`url(#${gradientId})`} d="M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 0 0-.64.05l-2.39 1.05a.96.96 0 0 1-1.35-.85l-.07-2.14a.97.97 0 0 0-.32-.68A11.39 11.39 0 0 1 .002 11.64zm8.32-2.19-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 0 0-2.61.48z" /></svg>;
}

export function TierProIcon() {
  return <svg className="tier-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17.6l-6.2 3.6 1.6-6.9-5.3-4.7 7-.7z" /></svg>;
}

export function TierBusinessIcon() {
  return <svg className="tier-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.5 3h11l4.5 6-10 12L2 9z" /></svg>;
}

export function TierEnterpriseIcon() {
  return <svg className="tier-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 8l4.6 3.8L12 4l4.4 7.8L21 8l-1.8 9.5H4.8zM4.8 19h14.4v2H4.8z" /></svg>;
}
