# AllMessage website (Next.js)

The AllMessage homepage plus the Milo product page at `/products/milo/`.

## Run it locally

Milo is a separate Next.js app (`Desktop\Milo\web`). Start it first, then this site:

```bash
# 1. Milo (port 5050)
cd C:\Users\Utente\Desktop\Milo\web
npm run build && npm start

# 2. AllMessage (port 2060)
cd "C:\Users\Utente\Desktop\New Allmessage Website\web"
npm install
npm run build && npm start
```

Open http://localhost:2060 (or http://192.168.0.17:2060 from another device on the same Wi-Fi).
The **Milo** tab in the header opens http://localhost:2060/products/milo/.

## Settings for the live site

Copy `.env.example` to `.env.local` (or set them on the host):

- `SITE_URL`: the public address, `https://allmessage.otech.one`. Without it the canonical URL,
  sitemap.xml and JSON-LD addresses are left out.
- `MILO_URL`: where Milo is deployed (see below). Leave it empty to switch Milo off.
  For local work use `MILO_URL=http://localhost:5050`.

## How Milo is attached

`next.config.mjs` forwards every `/products/milo/...` request to the Milo app
(Next.js "multi-zones"). Milo keeps its own code, build and deploy.
Milo is on only when `MILO_URL` is set to Milo's address. Without it the pages have no
Milo links (the header tab is removed, the footer lists Milo as plain text), `/products/milo/`
returns 404 and robots.txt doesn't list Milo's sitemap.

## Where to edit

| What | File |
| --- | --- |
| Page text and layout (header, sections, footer, demo form) | `app/home-markup.html` |
| Styles | `app/globals.css` |
| Animations, slider, plans toggle, demo form sending, WhatsApp button | `public/js/site.js` |
| Page title, description, theme colour | `app/head.json` (English: `meta` in `app/i18n/en.json`) |
| Canonical URL, hreflang, social preview, JSON-LD | `lib/site.js` (address from `SITE_URL`) |
| robots.txt, sitemap.xml | `app/robots.js`, `app/sitemap.js` |
| Images and videos | `public/media/`, `public/brand/` |
