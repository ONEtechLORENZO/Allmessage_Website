# AllMessage website (Next.js)

The AllMessage homepage plus the Milo product page at `/products/milo/`, built and deployed together.

## Run it locally

```bash
cd web
npm install
npm run build && npm start
```

Open http://localhost:2060 (or http://192.168.0.17:2060 from another device on the same Wi-Fi).
The **Milo** tab in the header opens http://localhost:2060/products/milo/.

## Settings for the live site

Copy `.env.example` to `.env.local` (or set them on the host):

- `SITE_URL`: the public address, `https://allmessage.otech.one`. Without it the canonical URL,
  sitemap.xml and JSON-LD addresses are left out.
- Milo page, optional: `NEXT_PUBLIC_GA_ID` (Google Analytics, loads only after cookie consent).
  Milo's "Richiedi Demo" form is the same one as the homepage (`public/js/demo-kit.js`).

## The Milo page

Milo is part of this site, at `/products/milo/` (Italian) and `/products/milo/en/` (English),
with its own privacy and cookie pages. It is built with React, TypeScript and Tailwind CSS
(Tailwind runs only on Milo's styles, see `next.config.mjs`).

| What | Where |
| --- | --- |
| Pages (layout, home, privacy, cookie policy, sitemap) | `app/(milo)/products/milo/` |
| Sections, header, footer, cookie banner | `milo/components/` |
| Texts (Italian / English) | `milo/dictionaries/it.json`, `en.json` |
| Company details, links | `milo/lib/site.ts` |
| Styles | `milo/milo.css` and the `.css` files next to the components |
| Images and icon | `public/products/milo/` |

The pages are built per language under `/products/milo/it/` and `/products/milo/en/`;
`next.config.mjs` shows the Italian ones at the short address without `it/`.

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
