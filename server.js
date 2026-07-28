const http = require("http");
const https = require("https");
const { URL } = require("url");

const port = Number(process.env.PORT || 10000);
const upstream = process.env.UPSTREAM;
if (!upstream) {
  console.error("UPSTREAM required");
  process.exit(1);
}
const base = new URL(upstream);

const agent = base.protocol === "https:"
  ? new https.Agent({ keepAlive: true })
  : new http.Agent({ keepAlive: true });

const server = http.createServer((req, res) => {
  const path = req.url || "/";
  const headers = { ...req.headers, host: base.host };
  delete headers["connection"];
  const opts = {
    protocol: base.protocol,
    hostname: base.hostname,
    port: base.port || (base.protocol === "https:" ? 443 : 80),
    path,
    method: req.method,
    headers,
    agent,
  };
  const lib = base.protocol === "https:" ? https : http;
  const preq = lib.request(opts, (pres) => {
    res.writeHead(pres.statusCode || 502, pres.headers);
    pres.pipe(res);
  });
  preq.on("error", (err) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "upstream", message: String(err.message) }));
  });
  req.pipe(preq);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`edge listening on ${port} -> ${upstream}`);
});
