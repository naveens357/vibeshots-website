# Vibeshots Nepal — Website

The live site: Astro (static, fast), with a no-code content manager (Decap CMS) at `/admin`. It is built from the plan in `../docs/` and the wireframe in `../wireframe/`.

## What's inside

| Path | What it is |
|---|---|
| `src/pages/` | Every page: home, weddings, a story per wedding, ceremony pages, packages, commercial, case studies, about, contact, journal, thank-you, 404 |
| `src/content/stories/` | Wedding stories (one Markdown file each) |
| `src/content/projects/` | Commercial case studies |
| `src/content/ceremonies/` | Ceremony SEO pages (Haldi, Janti, Newari wedding…) |
| `src/content/journal/` | Blog posts |
| `src/data/site.json` | Phones, WhatsApp, Instagram, stats, testimonials, client names, hero videos |
| `src/data/packages.json` | **All prices**: tiers, single events, add-ons, travel zones, payment terms, FAQ |
| `src/data/about.json` | About page text and team |
| `src/styles/global.css` | Design tokens and styles (spec in `../docs/02-design-system.md`) |
| `public/admin/` | The content manager |
| `public/uploads/` | Photos and videos uploaded through the content manager |
| `../netlify.toml` | Hosting build settings (at the repo root) |

Anything without a photo yet shows a **labelled colour placeholder**, so the site works before real media is added. Entries marked `sample: true` are sample text, so replace them.

## Run it on your computer

Everything installs inside this folder on F:. The `.npmrc` keeps npm's download cache in `site/.npm-cache`, and the npm scripts turn Astro's telemetry off, so nothing is written to C:.

```bash
cd site
npm install
```

```bash
npm run dev
```

Open http://localhost:4321.

## Editing content (no code)

### On your computer
Run these two commands in two terminals:

```bash
npm run dev
```

```bash
npm run cms
```

Then open http://localhost:4321/admin/index.html and click **Login** (no password locally). Changes save straight into the files in this folder.

### On the live site
Open `https://yourdomain/admin/`, sign in with GitHub, edit, and click **Publish**. The site rebuilds itself in about a minute.

### Common tasks
- **Add a wedding:** Wedding stories → New. Fill in the couple names, date (AD + BS), venue and ceremonies. Upload a cover, add gallery photos (choose Full, Half or Third for each), paste the YouTube or Vimeo film link, add vendor credits, write the story, then tick "Feature on home page" for the best ones.
- **Add a commercial project:** Commercial projects → New. Choose the sector and Stills and/or Motion, so the filters on `/commercial` pick it up.
- **Change a price:** Site settings → Packages & prices. Every price on the site, including the home page cards, early-bird prices, WhatsApp messages and Google data, updates from this one place.
- **Early-bird banner:** set the end date and text under Packages & prices → Early-bird offer. The banner hides itself after that date.
- **Team section:** Site settings → About page → Team. Each member has a name, role, experience (number first, for example "8 years", shown in the round badge), track record ("200+ weddings"), up to 3 specialties, a short bio, an Instagram handle and a 4:5 portrait. The section appears on the home page (without bios) and on the About page (with bios).
- **Hero videos:** Site settings → Contact, stats & reviews. Upload a 20–30 s muted MP4 under 6 MB, plus a poster image.
- **Remove a sample:** delete the sample entries once you have 3 or more real ones, or overwrite them and untick "Sample content".

### Photo tips
- Export at 2400 px on the long edge, JPG quality about 80, under 600 KB each.
- Always fill in **alt text**, for example "Bride in red saree during sindoor ceremony at Bhaktapur". It helps Google and screen readers.

## Going live (one-time setup)

1. **GitHub:** the whole project (docs, wireframe, site) is in the private repo `naveens357/vibeshots-website`. `main` is the live branch. Do new work on a branch and merge it into `main` through a pull request.
2. **CMS repo setting:** `public/admin/config.yml` already points at that repo. Its content paths start with `site/` because the repo root is the folder above this one.
3. **Netlify:** Add new site → Import from GitHub → pick the repo, with production branch `main`. The build settings come from `netlify.toml` at the repo root (base directory `site`).
4. **Forms:** in Netlify → Forms, turn on form detection, then add an email notification for `wedding-inquiry` and `commercial-brief`.
5. **CMS sign-in:** create a GitHub OAuth app (GitHub → Settings → Developer settings → OAuth Apps) with callback URL `https://api.netlify.com/auth/done`. Add its client ID and secret in Netlify → Site configuration → Access & security → OAuth → GitHub.
6. **Domain:** add `vibeshotsnepal.com` (and `vibeshots.com.np` if you get it) in Netlify → Domain management. If the domain is different, update `site` in `astro.config.mjs`, `site_url` in `public/admin/config.yml` and the sitemap line in `public/robots.txt`.
7. **Google:** submit `https://yourdomain/sitemap-index.xml` in Google Search Console, and add the site link to your Google Business Profile.

## Before launch checklist
- [ ] Replace the sample stories, projects, testimonial, team and founder note.
- [ ] Put real numbers in the stats bar (Site settings).
- [ ] Replace the placeholder client names with real ones you have permission to show.
- [ ] Set up a real `hello@` email address, or change the email in Site settings.
- [ ] Add a call-booking link (Cal.com or Calendly) in Site settings. Without one, "Book a call" opens WhatsApp.
- [ ] Get the logo as an SVG and replace `public/images/logo-*.png`.
- [ ] Test both forms on the live site.
