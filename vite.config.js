import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: { chunkSizeWarningLimit: 1500 },
  // Reachable over Tailscale/LAN. Vite >=5.4.12 rejects any request whose Host
  // header is not localhost/an IP ("Blocked request"), so the tailnet MagicDNS
  // names have to be allow-listed or http://desktop:5180 403s from the phone.
  // Bare IPs (http://100.x.y.z:5180) are always allowed and need no entry.
  server: {
    host: "0.0.0.0",
    port: 5180,
    strictPort: true,
    allowedHosts: ["desktop", ".ts.net", "localhost"],
  },
});
