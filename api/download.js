// Proxies Cvent-hosted assets so the browser triggers a real file download
// instead of navigating to the image (Cvent URLs are cross-origin, so a plain
// <a download> attribute can't force a download on its own).
const ALLOWED_HOST = "custom.cvent.com";

module.exports = async function handler(req, res) {
  const { url, name } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).send("Missing url parameter");
    return;
  }

  let target;
  try {
    target = new URL(url);
  } catch (err) {
    res.status(400).send("Invalid url parameter");
    return;
  }

  if (target.hostname !== ALLOWED_HOST) {
    res.status(400).send("Disallowed host");
    return;
  }

  let upstream;
  try {
    upstream = await fetch(target.toString());
  } catch (err) {
    res.status(502).send("Failed to fetch asset");
    return;
  }

  if (!upstream.ok) {
    res.status(502).send("Failed to fetch asset");
    return;
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await upstream.arrayBuffer());
  const safeName = (typeof name === "string" && name.trim() ? name : "download.png").replace(/[^a-zA-Z0-9._-]/g, "_");

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(buffer);
};
