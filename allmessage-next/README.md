# AllMessage — Next.js

The AllMessage landing page as a Next.js (App Router) + React app.

## Run

```bash
npm install
npm run dev      # http://localhost:3000 (also reachable on the LAN, e.g. http://192.168.0.17:3000)
npm run build && npm start   # production
```

## Structure

```
app/
  layout.js          <html>, Sora font (next/font/local), metadata, page-wide swallow
  page.js            assembles the sections
  globals.css        all styles
  fonts/Sora.ttf
  api/demo/route.js  receives "Richiedi Demo" requests
components/
  Header, Hero, HowItWorks, Plans, About, Integrations, Footer
  Swallow.jsx        bird that perches on elements marked data-perch
  SwallowSvg.jsx     the bird drawing (shared)
  motion.js          scroll reveals, pencil-sketch outlines, reduced-motion check
  icons.jsx          brand + plan tier icons
  art/               static SVG artwork (About scene, Integrations diagram)
  demo/              DemoProvider (open/close + DemoLink), DemoModal (4-step form), DemoSwallow
public/
  media/, brand/     images, videos, logos
```

## SEO

- `app/layout.js` — title, description, Open Graph / Twitter card, canonical.
- `app/page.js` — JSON-LD (`Organization` + `SoftwareApplication`).
- `app/robots.js`, `app/sitemap.js` — `/robots.txt`, `/sitemap.xml`.
- `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.png` (+ `.alt.txt`) — favicon, touch icon, social preview.
- `lib/site.js` — reads `SITE_URL`.

Set `SITE_URL` (see `.env.example`) to the production origin before going live. Until then the canonical
URL, the sitemap entries and the JSON-LD `url` are omitted, and `next build` prints a warning.

## "Richiedi Demo" form

Every `DemoLink` (header button, hero link, "Contattaci" on the plans) opens the form;
`/#richiedi-demo` opens it on page load. Submissions are POSTed to `/api/demo`, which validates
them and either logs them or, when `DEMO_FORWARD_URL` is set (see `.env.example`), forwards them
as JSON to a CRM or form-to-email service.
