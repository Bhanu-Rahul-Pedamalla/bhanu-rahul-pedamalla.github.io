// The deployed page is pre-rendered from resume.json by build.js. When opened
// straight from the repo (not built), render it here from resume.json instead.
(function () {
  "use strict";
  var R = window.ResumeRender;
  var main = document.getElementById("main");

  // Print the full project details even if collapsed.
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details").forEach(function (d) { d.open = true; });
  });

  if (main.hasAttribute("data-prerendered")) return;

  fetch("resume.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (r) {
      main.innerHTML = R.main(r);
      document.getElementById("aside").innerHTML = R.aside(r);
      document.getElementById("footer").innerHTML = R.footer(r, new Date().getFullYear());
      document.getElementById("nav-pdf").setAttribute("href", r.basics.resumePdf);
      document.title = R.meta(r).title;
      if (location.hash) {
        var t = document.querySelector(location.hash);
        if (t) t.scrollIntoView();
      }
    })
    .catch(function (err) {
      main.innerHTML = '<section class="card">Could not load resume.json (' + R.esc(err.message) +
        '). <a href="Bhanu_Pedamalla_Resume.pdf">Download the resume PDF</a>.</section>';
    });
})();
