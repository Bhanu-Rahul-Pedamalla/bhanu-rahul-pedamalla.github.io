// Pre-renders resume.json into index.html so the site is complete without JavaScript.
// Pulls live repo data (language, last update, stars, other public repos) from the
// GitHub API, and checks that every outbound link still answers.
// Usage: node build.js <outDir>   (writes <outDir>/index.html)
"use strict";
const fs = require("fs");
const path = require("path");
const R = require("./render.js");

const outDir = process.argv[2] || "_site";
const inCI = !!process.env.GITHUB_ACTIONS;
const r = JSON.parse(fs.readFileSync(path.join(__dirname, "resume.json"), "utf8"));
let html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

function warn(msg) { console.log((inCI ? "::warning::" : "warning: ") + msg); }

async function fetchRepos(user) {
  const headers = { "User-Agent": "site-build", Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
  try {
    const res = await fetch("https://api.github.com/users/" + user + "/repos?per_page=100&type=owner", { headers });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return R.indexRepos(await res.json());
  } catch (e) {
    warn("GitHub repo data unavailable (" + e.message + "); building without it.");
    return null;
  }
}

// Every outbound link in the content, so a dead demo never ships silently.
function links(r) {
  const urls = new Set(["https://github.com/" + r.site.github]);
  for (const p of r.projects) {
    if (p.repo) urls.add("https://github.com/" + r.site.github + "/" + p.repo);
    for (const k of ["simulation", "report", "site"]) if (p[k]) urls.add(p[k]);
  }
  for (const e of r.experience || []) if (e.url) urls.add(e.url);
  return [...urls];
}

async function checkLinks(urls) {
  await Promise.all(urls.map(async (u) => {
    try {
      const res = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (!res.ok) warn("Link returns HTTP " + res.status + ": " + u);
    } catch (e) {
      warn("Link unreachable (" + e.message + "): " + u);
    }
  }));
}

function fill(name, content) {
  const re = new RegExp("<!--render:" + name + "-->[\\s\\S]*?<!--/render:" + name + "-->");
  if (!re.test(html)) throw new Error("Missing render marker: " + name);
  html = html.replace(re, () => content);
}

(async () => {
  for (const id of [].concat(r.site.featured || [], r.site.spotlight || [], r.site.product || [], (r.site.moreRepos || {}).extra || [])) {
    if (!r.projects.some((p) => p.id === id)) throw new Error("site config names unknown project id: " + id);
  }

  const [gh] = await Promise.all([fetchRepos(r.site.github), checkLinks(links(r))]);
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
  fill("page", R.page(r, gh, new Date().getFullYear()));
  html = html.replace('<div id="app"', '<div id="app" data-prerendered');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log("Wrote " + path.join(outDir, "index.html") + " (" + html.length + " bytes, " +
    (gh ? gh.list.length + " repos from GitHub" : "no GitHub data") + ")");
})().catch((err) => { console.error(err); process.exit(1); });
