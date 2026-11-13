// Renders promo.html to promo.mp4 (1080x1920, 30 fps, 20 s).
// Usage: node motion/render.js
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");

(async () => {
  const FPS = 30;
  const out = path.join(__dirname, "promo.mp4");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + path.join(__dirname, "promo.html") + "?render");
  await page.evaluate(() => window.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = duration * FPS;
  for (let i = 0; i < frames; i++) {
    const data = await page.evaluate(t => { window.renderFrame(t); return document.getElementById("c").toDataURL("image/png"); }, i / FPS);
    const buf = Buffer.from(data.split(",")[1], "base64");
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % 60 === 0) process.stdout.write(`frame ${i}/${frames}\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log("Listo:", out);
})();
