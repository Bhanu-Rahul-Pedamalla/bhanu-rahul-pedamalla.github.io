// Pre-renders resume.json into index.html so the profile is visible without JavaScript.
// Usage: node build.js <outDir>   (writes <outDir>/index.html)
"use strict";
const fs = require("fs");
const path = require("path");
const R = require("./render.js");

const outDir = process.argv[2] || "_site";
const r = JSON.parse(fs.readFileSync(path.join(__dirname, "resume.json"), "utf8"));
let html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

function fill(name, content) {
  const re = new RegExp("<!--render:" + name + "-->[\\s\\S]*?<!--/render:" + name + "-->");
  if (!re.test(html)) throw new Error("Missing render marker: " + name);
  html = html.replace(re, () => content);
}

const m = R.meta(r);
const e = R.esc;
fill("head", [
  "<title>" + e(m.title) + "</title>",
  '<meta name="description" content="' + e(m.description) + '">',
  '<meta property="og:type" content="profile">',
  '<meta property="og:title" content="' + e(m.title) + '">',
  '<meta property="og:description" content="' + e(m.description) + '">',
  m.url ? '<meta property="og:url" content="' + e(m.url) + '">' : "",
  m.url ? '<link rel="canonical" href="' + e(m.url) + '">' : "",
  '<meta name="twitter:card" content="summary">',
  '<meta name="twitter:title" content="' + e(m.title) + '">',
  '<meta name="twitter:description" content="' + e(m.description) + '">'
].filter(Boolean).join("\n  "));
fill("main", R.main(r));
fill("aside", R.aside(r));
fill("footer", R.footer(r, new Date().getFullYear()));
html = html
  .replace('<main id="main"', '<main id="main" data-prerendered')
  .replace(/(id="nav-pdf" href=")[^"]*"/, (_, a) => a + e(r.basics.resumePdf) + '"');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log("Wrote " + path.join(outDir, "index.html") + " (" + html.length + " bytes)");
