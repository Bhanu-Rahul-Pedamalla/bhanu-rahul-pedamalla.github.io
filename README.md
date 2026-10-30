# bhanu-rahul-pedamalla.github.io

Personal site. Plain HTML/CSS/JS, no framework. Everything comes from one file: `resume.json`.

## Change what the site highlights

All of this is in the `"site"` block of `resume.json`. Edit it, push, and the site rebuilds.

| You want to… | Change |
| --- | --- |
| Put a different project in the big spotlight card | `"spotlight": "shelf"` (any project `id`) |
| Feature, drop or reorder projects | `"featured": ["rovi", "casefinding", "shelf"]` |
| Change the three headline numbers under the intro | `"proof"` |
| Reorder or hide whole sections | `"sections"`: any of `proof, work, product, principles, more, experience, stack, contact` |
| Change the one-line pitch or status pill | `"intro"`, `"sub"`, `"status"` |
| Hide a repo from "More on GitHub" | add its name to `"moreRepos.exclude"` |

A new public repo appears under "More on GitHub" automatically. Add it as a project
(with `"repo": "<name>"`) and put its `id` in `"featured"` to give it a full card.

Each project card shows its buttons in this order: **GitHub repo** → **Simulation setup** → **Pipeline report** (from `repo`, `simulation`, `report`).

## How it builds

- `render.js` turns `resume.json` into HTML.
- The deploy Action runs `build.js`. It pulls each repo's language and last-update date from the GitHub API,
  checks that every link still answers (dead links show as warnings on the run), and writes the finished
  `index.html`, so the page works without JavaScript and link previews (Open Graph) are correct.
- The Action runs on every push and again weekly, so the "Updated" dates stay current.
- `Bhanu_Pedamalla_Resume.pdf` backs the Resume buttons. Replace the file to update it.

Preview locally: `python -m http.server` in this folder, then open http://localhost:8000
(renders in the browser from `resume.json`), or `node build.js _site` for the built version.
