// Turns resume.json (+ optional GitHub repo data) into the page HTML. Shared by
// build.js (static pre-render in the GitHub Action) and app.js (browser fallback).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SiteRender = factory();
})(this, function () {
  "use strict";

  var I = {
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.6 7.6 0 0 1 8 3.87c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11a.5.5 0 0 0 .76.43l9-5.5a.5.5 0 0 0 0-.86l-9-5.5A.5.5 0 0 0 4 2.5z"/></svg>',
    doc: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 1h5.5L13 4.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm5 1.2V5h2.8L9 2.2zM5 8h6v1H5V8zm0 2.5h6v1H5v-1z"/></svg>',
    mail: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3h13a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm.5 1.3v.4l6 3.9 6-3.9v-.4H2zm12 1.6-6 3.9-6-3.9V12h12V5.9z"/></svg>',
    out: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h8v8h-1.5V5.56l-7.47 7.47-1.06-1.06L10.44 4.5H5V3z"/></svg>',
    down: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7.25 1h1.5v8.19l2.72-2.72 1.06 1.06L8 12.06 3.47 7.53l1.06-1.06 2.72 2.72V1zM2 13.5h12V15H2v-1.5z"/></svg>',
    star: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .9l2.2 4.6 5 .7-3.6 3.5.9 5L8 12.3l-4.5 2.4.9-5L.8 6.2l5-.7L8 .9z"/></svg>'
  };

  var LANG = { Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c", Jupyter: "#DA5B0B", "Jupyter Notebook": "#DA5B0B", SQL: "#e38c00" };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function a(url, inner, cls, newTab) {
    return "<a" + (cls ? ' class="' + cls + '"' : "") + ' href="' + esc(url) + '"' +
      (newTab === false ? "" : ' target="_blank" rel="noopener"') + ">" + inner + "</a>";
  }
  function date(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }
  function byId(r, id) { return r.projects.filter(function (p) { return p.id === id; })[0]; }
  function repoUrl(r, repo) { return "https://github.com/" + r.site.github + "/" + repo; }
  function ghUrl(r) { return "https://github.com/" + r.site.github; }

  function repoMeta(repo) {
    if (!repo) return "";
    var bits = [];
    if (repo.language) bits.push('<span class="lang"><i style="background:' + (LANG[repo.language] || "#8b8b93") + '"></i>' + esc(repo.language) + "</span>");
    if (repo.stargazers_count) bits.push('<span class="stars">' + I.star + repo.stargazers_count + "</span>");
    if (repo.pushed_at) bits.push("<span>Updated " + date(repo.pushed_at) + "</span>");
    return bits.length ? '<div class="repo-meta">' + bits.join("") + "</div>" : "";
  }

  // ---------- sections ----------

  function nav(r) {
    return '<header class="nav"><div class="wrap nav-inner">' +
      '<a class="brand" href="#top">' + esc(r.basics.name) + "</a>" +
      '<nav class="nav-links" aria-label="Sections">' +
        '<a href="#work">Work</a><a href="#principles">How I build</a><a href="#experience">Experience</a><a href="#contact">Contact</a>' +
      "</nav>" +
      '<div class="nav-cta">' +
        a(r.basics.resumePdf, "Resume", "nav-resume", false) +
        a(ghUrl(r), I.github + "<span>GitHub</span>", "btn btn-dark btn-sm") +
      "</div></div></header>";
  }

  function hero(r) {
    var b = r.basics, s = r.site;
    return '<section class="hero wrap" id="top">' +
      (s.status ? '<p class="status"><span class="pulse" aria-hidden="true"></span>' + esc(s.status) + "</p>" : "") +
      "<h1>" + esc(b.name) + "</h1>" +
      '<p class="lead">' + esc(s.intro) + "</p>" +
      (s.sub ? '<p class="sub">' + esc(s.sub) + "</p>" : "") +
      '<div class="cta">' +
        a(ghUrl(r), I.github + "github.com/" + esc(s.github), "btn btn-primary") +
        a("mailto:" + b.email, I.mail + "Email me", "btn btn-outline", false) +
        a(b.resumePdf, I.down + "Resume PDF", "btn btn-ghost", false) +
      "</div>" +
      '<p class="facts">' + [b.location, b.relocation, b.workAuthorization].filter(Boolean).map(esc).join('<span aria-hidden="true">·</span>') + "</p>" +
      "</section>";
  }

  function proof(r) {
    if (!r.site.proof || !r.site.proof.length) return "";
    return '<section class="wrap proof" aria-label="Results">' +
      r.site.proof.map(function (x) {
        var p = byId(r, x.project);
        return a("#p-" + x.project,
          '<b>' + esc(x.value) + "</b><span>" + esc(x.label) + "</span>" +
          (p ? '<em>' + esc(p.name) + " →</em>" : ""), "proof-tile", false);
      }).join("") + "</section>";
  }

  function actions(r, p) {
    var out = [];
    if (p.repo) out.push(a(repoUrl(r, p.repo), I.github + "GitHub repo", "btn btn-primary btn-sm"));
    if (p.simulation) out.push(a(p.simulation, I.play + "Simulation setup", "btn btn-outline btn-sm"));
    if (p.report) out.push(a(p.report, I.doc + "Pipeline report", "btn btn-ghost btn-sm"));
    if (p.site) out.push(a(p.site, I.out + p.site.replace(/^https?:\/\//, ""), "btn btn-primary btn-sm"));
    return out.length ? '<div class="actions">' + out.join("") + "</div>" : "";
  }

  function stats(p) {
    if (!p.stats || !p.stats.length) return "";
    return '<dl class="stats">' + p.stats.map(function (s) {
      return "<div><dt>" + esc(s.label) + "</dt><dd>" + esc(s.value) + "</dd></div>";
    }).join("") + "</dl>";
  }

  function details(p, label) {
    if (!p.highlights || !p.highlights.length) return "";
    return '<details class="more"><summary>' + (label || "How it works") + "</summary><ul>" +
      p.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul></details>";
  }

  function tags(p) {
    return p.tags && p.tags.length
      ? '<ul class="tags">' + p.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"
      : "";
  }

  function projectCard(r, gh, p, spotlight) {
    var repo = p.repo && gh && gh.byName[p.repo];
    return '<article class="project' + (spotlight ? " spotlight" : "") + '" id="p-' + esc(p.id) + '">' +
      (p.repo
        ? '<div class="repo-line">' + a(repoUrl(r, p.repo), I.github + '<span class="slug"><span class="owner">' + esc(r.site.github) + '/</span><span class="repo">' + esc(p.repo) + "</span></span>", "repo-link") + repoMeta(repo) + "</div>"
        : "") +
      '<div class="project-body"><div class="project-main">' +
        '<h3>' + esc(p.name) + '<span class="when">' + esc(p.date) + "</span></h3>" +
        '<p class="tagline">' + esc(p.tagline) + "</p>" +
        (spotlight && p.problem ? '<p class="problem">' + esc(p.problem) + "</p>" : "") +
        (p.decision ? '<div class="decision"><span>Key decision</span><p>' + esc(p.decision) + "</p></div>" : "") +
        tags(p) +
      "</div>" +
      '<div class="project-side">' + stats(p) + "</div></div>" +
      details(p) +
      actions(r, p) +
      "</article>";
  }

  function work(r, gh) {
    var ids = r.site.featured || [];
    var spot = r.site.spotlight;
    var rest = ids.filter(function (id) { return id !== spot; });
    return '<section class="wrap section" id="work">' +
      '<div class="section-head"><h2>Featured work</h2><p>Every repo is public. Open the simulation, read the report, then read the code.</p></div>' +
      (spot && byId(r, spot) ? projectCard(r, gh, byId(r, spot), true) : "") +
      '<div class="grid-2">' + rest.map(function (id) { return byId(r, id) ? projectCard(r, gh, byId(r, id), false) : ""; }).join("") + "</div>" +
      "</section>";
  }

  function product(r) {
    var p = r.site.product && byId(r, r.site.product);
    if (!p) return "";
    return '<section class="wrap section" id="product">' +
      '<div class="section-head"><h2>Product I run</h2></div>' +
      '<article class="project product" id="p-' + esc(p.id) + '">' +
        '<div class="project-body"><div class="project-main">' +
          '<h3>' + esc(p.name) + '<span class="when">' + esc(p.date) + "</span></h3>" +
          '<p class="tagline">' + esc(p.tagline) + "</p>" +
          (p.decision ? '<div class="decision"><span>Key decision</span><p>' + esc(p.decision) + "</p></div>" : "") +
          tags(p) +
        "</div>" +
        '<div class="project-side">' + stats(p) + "</div></div>" +
        details(p, "What I built") +
        actions(r, p) +
      "</article></section>";
  }

  function principles(r) {
    if (!r.principles || !r.principles.length) return "";
    return '<section class="wrap section" id="principles">' +
      '<div class="section-head"><h2>How I build</h2><p>Four rules I hold every pipeline to, and where to check them.</p></div>' +
      '<ol class="principles">' + r.principles.map(function (x, i) {
        var p = byId(r, x.project);
        return '<li><span class="num">0' + (i + 1) + "</span><h3>" + esc(x.title) + "</h3><p>" + esc(x.proof) + "</p>" +
          (p ? a("#p-" + p.id, "See " + esc(p.name) + " →", "", false) : "") + "</li>";
      }).join("") + "</ol></section>";
  }

  function more(r, gh) {
    var cfg = r.site.moreRepos || {};
    var used = r.projects.map(function (p) { return p.repo; }).filter(Boolean);
    var exclude = (cfg.exclude || []).concat(used);
    var repos = cfg.auto && gh ? gh.list.filter(function (x) { return !x.fork && !x.archived && exclude.indexOf(x.name) < 0; }) : [];
    var extras = (cfg.extra || []).map(function (id) { return byId(r, id); }).filter(Boolean);
    if (!repos.length && !extras.length) return "";
    var cards = repos.map(function (x) {
      return '<article class="mini">' +
        a(x.html_url, I.github + '<span class="repo">' + esc(x.name) + "</span>", "repo-link") +
        (x.description ? "<p>" + esc(x.description) + "</p>" : "") + repoMeta(x) +
        (x.homepage ? a(x.homepage, "Live " + I.out, "mini-link") : "") +
        "</article>";
    }).concat(extras.map(function (p) {
      return '<article class="mini"><h3>' + esc(p.name) + '<span class="when">' + esc(p.date) + "</span></h3>" +
        "<p>" + esc(p.tagline) + "</p>" + tags(p) + "</article>";
    }));
    return '<section class="wrap section" id="more">' +
      '<div class="section-head"><h2>More on GitHub</h2></div>' +
      '<div class="grid-3">' + cards.join("") +
        a(ghUrl(r) + "?tab=repositories", I.github + "<span>All repositories</span><em>github.com/" + esc(r.site.github) + " →</em>", "mini mini-all") +
      "</div></section>";
  }

  function experience(r) {
    var rows = (r.experience || []).map(function (e) {
      return '<li><div class="tl-when">' + esc(e.start) + " – " + esc(e.end) + "</div>" +
        '<div><h3>' + esc(e.title) + ' <span class="at">' + (e.url ? a(e.url, esc(e.company)) : esc(e.company)) + "</span></h3>" +
        (e.summary ? "<p>" + esc(e.summary) + "</p>" : "") + "</div></li>";
    }).concat((r.education || []).map(function (e) {
      return '<li><div class="tl-when">' + esc(e.start) + " – " + esc(e.end) + "</div>" +
        '<div><h3>' + esc(e.degree) + ' <span class="at">' + esc(e.school) + "</span></h3>" +
        (e.details ? "<p>" + esc(e.details) + "</p>" : "") + "</div></li>";
    }));
    return '<section class="wrap section" id="experience">' +
      '<div class="section-head"><h2>Experience and education</h2></div>' +
      '<ol class="timeline">' + rows.join("") + "</ol></section>";
  }

  function stack(r) {
    if (!r.skills || !r.skills.length) return "";
    return '<section class="wrap section" id="stack">' +
      '<div class="section-head"><h2>Stack</h2></div>' +
      '<div class="stack">' + r.skills.map(function (g) {
        return "<div><h3>" + esc(g.category) + '</h3><ul class="tags">' +
          g.items.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</div></section>";
  }

  function contact(r) {
    var b = r.basics;
    return '<section class="wrap section contact" id="contact">' +
      "<h2>Let's talk.</h2>" +
      '<p class="sub">The fastest way to reach me is email.</p>' +
      a("mailto:" + b.email, esc(b.email), "contact-mail", false) +
      '<div class="cta">' +
        a(ghUrl(r), I.github + "GitHub", "btn btn-primary") +
        a(b.resumePdf, I.down + "Resume PDF", "btn btn-ghost", false) +
      "</div></section>";
  }

  function footer(r, year) {
    return '<footer class="footer wrap"><span>© ' + year + " " + esc(r.basics.name) + "</span>" +
      "<span>Plain HTML, pre-rendered from one JSON file. " +
      a(repoUrl(r, r.site.github.toLowerCase() + ".github.io"), "Source") + "</span></footer>";
  }

  var SECTIONS = { proof: proof, work: work, product: product, principles: principles, more: more, experience: experience, stack: stack, contact: contact };

  function page(r, gh, year) {
    var order = r.site.sections || Object.keys(SECTIONS);
    return nav(r) + "<main>" + hero(r) +
      order.map(function (k) { return SECTIONS[k] ? SECTIONS[k](r, gh) : ""; }).join("") +
      "</main>" + footer(r, year);
  }

  function meta(r) {
    var b = r.basics;
    return {
      title: b.name + " | " + b.headline,
      description: r.site.intro,
      url: r.site.url || ""
    };
  }

  // Shapes the GitHub /users/:user/repos response for rendering.
  function indexRepos(list) {
    var byName = {};
    list = (list || []).slice().sort(function (x, y) { return String(y.pushed_at).localeCompare(String(x.pushed_at)); });
    list.forEach(function (x) { byName[x.name] = x; });
    return { list: list, byName: byName };
  }

  return { esc: esc, meta: meta, page: page, indexRepos: indexRepos };
});
