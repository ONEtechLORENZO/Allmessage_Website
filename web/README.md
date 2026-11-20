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

## How Milo is attached

`next.config.mjs` forwards every `/products/milo/...` request to the Milo app
(Next.js "multi-zones"). Milo keeps its own code, build and deploy.
In production set the `MILO_URL` environment variable to Milo's deployed address
(default: `http://localhost:5050`).

## Where to edit

| What | File |
| --- | --- |
| Page text and layout (header, sections, footer, demo form) | `app/home-markup.html` |
| Styles | `app/globals.css` |
| Animations, slider, plans toggle, demo form sending, WhatsApp button | `public/js/site.js` |
| Page title, description, theme colour | `app/head.json` |
| Images and videos | `public/media/`, `public/brand/` |
