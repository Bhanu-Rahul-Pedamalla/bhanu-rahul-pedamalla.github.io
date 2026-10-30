// The deployed page is pre-rendered by build.js. When the repo copy is opened
// directly (not built), render it here from resume.json and the GitHub API instead.
(function () {
  "use strict";
  var R = window.SiteRender;
  var app = document.getElementById("app");

  // Print the full project details even if collapsed.
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details").forEach(function (d) { d.open = true; });
  });

  if (app.hasAttribute("data-prerendered")) return;

  fetch("resume.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (r) {
      return fetch("https://api.github.com/users/" + r.site.github + "/repos?per_page=100&type=owner")
        .then(function (res) { return res.ok ? res.json() : null; })
        .catch(function () { return null; })
        .then(function (list) {
          app.innerHTML = R.page(r, list ? R.indexRepos(list) : null, new Date().getFullYear());
          document.title = R.meta(r).title;
          if (location.hash) {
            var t = document.querySelector(location.hash);
            if (t) t.scrollIntoView();
          }
        });
    })
    .catch(function (err) {
      app.innerHTML = '<p class="loading">Could not load resume.json (' + R.esc(err.message) +
        '). <a href="Bhanu_Pedamalla_Resume.pdf">Download the resume PDF</a>.</p>';
    });
})();
