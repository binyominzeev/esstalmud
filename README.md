# EssTalmud

Bavli browser on the Sefaria API (separate Next.js project, e.g. for talmud.esstorah.com).

- `npm install && npm run dev` (or `npm run build && npm start`; server-rendered, Sefaria responses cached 24h)
- URLs: `/berakhot/2a`, `/berakhot/2a/3` (selected segment); `/berakhot` redirects to `2a`
- Tractate list: `lib/tractates.ts`, regenerate with `python3 scripts/gen-tractates.py`
- Right panel: Sefaria link + AI question map for the clicked segment (commentaries grouped by phrase and question, Hungarian summaries, links to the sources). It reuses the Torah site's backend (`../api/server.py` + `../meforshim`, refs like `Berakhot.2a.5`); `next.config.js` proxies `/api/*` to `API_ORIGIN` (default `http://127.0.0.1:8001`; behind nginx proxy `/api/` directly). Segments with a finished map are marked with a gold edge.
