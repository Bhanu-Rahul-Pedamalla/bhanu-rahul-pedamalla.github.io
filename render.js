// Turns resume.json into page HTML. Shared by build.js (static pre-render in the
// GitHub Action) and app.js (fallback rendering when the page was not pre-rendered).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ResumeRender = factory();
})(this, function () {
  "use strict";

  var ICONS = {
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v9.17l3.59-3.58L18 10l-6 6-6-6 1.41-1.41L11 12.17V3zM5 18h14v2H5z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function initials(name) {
    return String(name).split(/[\s/&]+/).filter(Boolean)
      .filter(function (w) { return /^[A-Z]/.test(w); })
      .slice(0, 2).map(function (w) { return w[0]; }).join("");
  }
  function nameInitials(name) {
    var w = String(name).trim().split(/\s+/);
    return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
  }
  function range(a, b) { return esc(a) + (b ? " – " + esc(b) : ""); }
  function profile(b, network) {
    return (b.profiles || []).filter(function (p) { return p.network === network; })[0];
  }
  function ext(url, label, cls) {
    return '<a' + (cls ? ' class="' + cls + '"' : "") + ' href="' + esc(url) +
      '" target="_blank" rel="noopener">' + esc(label) + "</a>";
  }

  function header(r) {
    var b = r.basics;
    var gh = profile(b, "GitHub");
    var avatar = b.photo
      ? '<img class="avatar" src="' + esc(b.photo) + '" alt="Photo of ' + esc(b.name) + '" width="152" height="152">'
      : '<div class="avatar" role="img" aria-label="' + esc(b.name) + '">' + esc(nameInitials(b.name)) + "</div>";
    return '<section class="card profile">' +
      '<div class="banner"></div>' +
      '<div class="profile-body">' + avatar +
        "<h1>" + esc(b.name) + (b.credential ? ' <span class="cred"><span class="sep">· </span>' + esc(b.credential) + "</span>" : "") + "</h1>" +
        '<p class="headline">' + esc(b.headline) + "</p>" +
        '<div class="meta"><span>' + esc(b.location) + "</span>" +
          (b.relocation ? '<span class="dot">' + esc(b.relocation) + "</span>" : "") +
          '<span class="dot"><a href="#contact">Contact info</a></span></div>' +
        (b.workAuthorization ? '<span class="badge">' + esc(b.workAuthorization) + "</span>" : "") +
        '<div class="actions">' +
          '<a class="btn btn-primary" href="' + esc(b.resumePdf) + '" download>' + ICONS.download + "Download resume PDF</a>" +
          '<a class="btn btn-outline" href="mailto:' + esc(b.email) + '">' + ICONS.mail + "Email</a>" +
          (gh ? '<a class="btn btn-ghost" href="' + esc(gh.url) + '" target="_blank" rel="noopener">' + ICONS.github + "GitHub</a>" : "") +
        "</div>" +
      "</div></section>";
  }

  function about(r) {
    if (!r.about || !r.about.length) return "";
    return '<section class="card about" id="about"><h2>About</h2>' +
      r.about.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</section>";
  }

  function bullets(items) {
    if (!items || !items.length) return "";
    return '<ul class="bullets">' +
      items.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>";
  }

  function experience(r) {
    return '<section class="card" id="experience"><h2>Experience</h2>' +
      r.experience.map(function (e) {
        return '<article class="entry"><div class="logo" aria-hidden="true">' + esc(initials(e.company)) + "</div>" +
          '<div class="entry-body"><h3>' + esc(e.title) + "</h3>" +
          '<div class="sub">' + (e.url ? ext(e.url, e.company) : esc(e.company)) + "</div>" +
          '<div class="when">' + range(e.start, e.end) + (e.location ? " · " + esc(e.location) : "") + "</div>" +
          (e.summary ? '<p class="summary">' + esc(e.summary) + "</p>" : "") +
          bullets(e.highlights) + "</div></article>";
      }).join("") + "</section>";
  }

  function projects(r) {
    return '<section class="card" id="projects"><h2>Projects</h2>' +
      r.projects.map(function (p) {
        var stats = (p.stats || []).map(function (s) {
          return '<div class="stat"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>";
        }).join("");
        return '<article class="project"><div class="project-head"><h3>' + esc(p.name) + "</h3>" +
          '<span class="when">' + esc(p.date) + "</span></div>" +
          (p.context ? '<div class="context">' + esc(p.context) + "</div>" : "") +
          (p.problem ? '<p class="problem">' + esc(p.problem) + "</p>" : "") +
          (stats ? '<div class="stats">' + stats + "</div>" : "") +
          (p.highlights && p.highlights.length
            ? '<details class="more"><summary>Show details</summary>' + bullets(p.highlights) + "</details>"
            : "") +
          (p.links && p.links.length
            ? '<div class="links">' + p.links.map(function (l, j) {
                return ext(l.url, l.label, j === 0 ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm");
              }).join("") + "</div>"
            : "") +
          "</article>";
      }).join("") + "</section>";
  }

  function skills(r) {
    return '<section class="card" id="skills"><h2>Skills</h2>' +
      r.skills.map(function (g) {
        return '<div class="skill-group"><h3>' + esc(g.category) + '</h3><ul class="chips">' +
          g.items.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</section>";
  }

  function education(r) {
    return '<section class="card" id="education"><h2>Education</h2>' +
      r.education.map(function (e) {
        return '<article class="entry"><div class="logo" aria-hidden="true">' + esc(initials(e.school)) + "</div>" +
          '<div class="entry-body"><h3>' + esc(e.school) + "</h3>" +
          '<div class="sub">' + esc(e.degree) + "</div>" +
          '<div class="when">' + range(e.start, e.end) + "</div>" +
          (e.details && e.details.length ? '<div class="sub details">' + e.details.map(esc).join(" · ") + "</div>" : "") +
          "</div></article>";
      }).join("") + "</section>";
  }

  function aside(r) {
    var b = r.basics;
    var gh = profile(b, "GitHub");
    function row(icon, k, v) {
      return "<li>" + ICONS[icon] + '<div><span class="k">' + k + '</span><span class="v">' + v + "</span></div></li>";
    }
    var contact = '<section class="card" id="contact"><h2>Contact</h2><ul class="contact-list">' +
      row("mail", "Email", '<a href="mailto:' + esc(b.email) + '">' + esc(b.email) + "</a>") +
      (gh ? row("github", "GitHub", ext(gh.url, gh.label)) : "") +
      row("pin", "Location", esc(b.location) + (b.relocation ? " · " + esc(b.relocation) : "")) +
      (b.workAuthorization ? row("check", "Work authorization", esc(b.workAuthorization)) : "") +
      "</ul></section>";

    var demos = r.projects.filter(function (p) { return p.links && p.links.length; });
    var live = demos.length
      ? '<section class="card"><h2>Live work</h2><ul class="demo-list">' +
        demos.map(function (p) {
          return '<li><span class="demo-name">' + esc(p.name) + '</span><span class="demo-links">' +
            p.links.map(function (l) { return ext(l.url, l.label); }).join(" · ") + "</span></li>";
        }).join("") + "</ul></section>"
      : "";
    return contact + live;
  }

  function footer(r, year) {
    return "© " + year + " " + esc(r.basics.name) +
      ' · <a href="' + esc(r.basics.resumePdf) + '" download>Resume PDF</a>';
  }

  function meta(r) {
    var b = r.basics;
    var title = b.name + " | " + b.headline;
    var description = b.headline + ". " + b.credential + ". " + b.location +
      (b.relocation ? ", " + b.relocation.toLowerCase() : "") + ".";
    return { title: title, description: description, url: b.url || "" };
  }

  return {
    esc: esc,
    meta: meta,
    main: function (r) { return header(r) + about(r) + experience(r) + projects(r) + skills(r) + education(r); },
    aside: aside,
    footer: footer
  };
});
