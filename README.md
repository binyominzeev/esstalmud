# EssTalmud

Bavli browser on the Sefaria API (separate Next.js project, e.g. for talmud.esstorah.com).

- `npm install && npm run dev` (or `npm run build && npm start`; server-rendered, Sefaria responses cached 24h)
- Production: run `npm run build`, then keep `npm start` running (default port `3000`). To use another port, run `npm start -- -p 3001` (or `PORT=3001 npm start`). You can keep it running with PM2 using `pm2 start npm --name esstalmud -- start`; for a custom port, use `pm2 start npm --name esstalmud -- start -- -p 3001`. Nginx should reverse-proxy the site to the selected port; do not serve `.next/` as a static document root.
- Nginx should proxy `/api/` directly to the shared backend at `http://127.0.0.1:8001` (preserving the `/api/` path); proxy all other paths to the app's selected port (default `3000`).
- URLs: `/berakhot/2a`, `/berakhot/2a/3` (selected segment); `/berakhot` redirects to `2a`
- Tractate list: `lib/tractates.ts`, regenerate with `python3 scripts/gen-tractates.py`
- Right panel: Sefaria link + AI question map for the clicked segment (commentaries grouped by phrase and question, Hungarian summaries, links to the sources). It reuses the Torah site's backend (`../api/server.py` + `../meforshim`, refs like `Berakhot.2a.5`); `next.config.js` proxies `/api/*` to `API_ORIGIN` (default `http://127.0.0.1:8001`; behind nginx proxy `/api/` directly). Segments with a finished map are marked with a gold edge.
