// Public origin of the site, e.g. https://example.com (set SITE_URL, see .env.example).
// Until it is set, canonical / sitemap / JSON-LD URLs are left out instead of pointing at localhost.
const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');

export const SITE_URL = configured || null;

// Only used to resolve the social-preview image URL while SITE_URL is unset.
export const METADATA_BASE = new URL(SITE_URL || 'http://localhost:3000');

export const SITE_NAME = 'AllMessage';
export const SITE_TITLE = 'AllMessage — Tutte le conversazioni, un unico posto';
export const SITE_DESCRIPTION = 'AllMessage riunisce le conversazioni della tua azienda. Gestisci messaggi, automazioni e integrazioni in un unico posto.';
