# bhanu-rahul-pedamalla.github.io

Personal resume site. Plain HTML/CSS/JS, no build step.

- **Content:** everything lives in `resume.json`. `render.js` turns it into HTML. In the deploy Action,
  `build.js` writes it into `index.html` ahead of time, so the profile and the Open Graph tags work without JavaScript.
  When you open the repo copy directly (not built), `app.js` renders it in the browser instead.
- **PDF:** `Bhanu_Pedamalla_Resume.pdf` backs the "Download resume PDF" button. Replace the file to update it.
- **Photo (optional):** add `photo.jpg` and set `"photo": "photo.jpg"` in `resume.json`. Without it, the page shows initials.
- **Deploy:** every push to `main` runs `.github/workflows/deploy.yml`, which publishes to GitHub Pages.
  (Repo Settings → Pages → Source must be "GitHub Actions".)

Preview locally: `python -m http.server` in this folder, then open http://localhost:8000.
