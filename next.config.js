/** @type {import('next').NextConfig} */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://127.0.0.1:8001";

module.exports = {
  // The question-map backend (../api/server.py) is shared with the Torah site; behind nginx /api/ is proxied directly instead.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
  },
};
