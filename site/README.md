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
| `../.github/workflows/deploy.yml` | Builds and publishes the site to GitHub Pages on every push to `main` |
| `../netlify.toml` | Optional Netlify build settings |

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
Open `/admin/` on the live site, sign in with GitHub, edit, and click **Publish**. The site rebuilds itself in about a minute. This needs the OAuth helper described under "Hosting: GitHub Pages"; until then, edit on your computer.

### Common tasks
- **Add a wedding:** Wedding stories → New. Fill in the couple names, date (AD + BS), venue and ceremonies. Upload a cover, add gallery photos (choose Full, Half or Third for each), paste the YouTube or Vimeo film link, add vendor credits, write the story, then tick "Feature on home page" for the best ones.
- **Add a commercial project:** Commercial projects → New. Choose the sector and Stills and/or Motion, so the filters on `/commercial` pick it up.
- **Change a price:** Site settings → Packages & prices. Every price on the site, including the home page cards, early-bird prices, WhatsApp messages and Google data, updates from this one place.
- **Early-bird banner:** set the end date and text under Packages & prices → Early-bird offer. The banner hides itself after that date.
- **Home page:** Site settings → Home page holds the welcome title and lines, the hero photo or video, the quote, and the three banner blocks (What we love / believe / do). Banner photos are shown in black and white and drift slowly as you scroll (parallax).
- **Story titles:** each wedding story has a "Story title phrase", for example *Two Lanes Apart*. It's shown in spaced capitals above the couple's names, like The Wedding Story's stories.
- **Films:** Films → New. Pick Reel, Highlight film or Full film, paste the YouTube or Vimeo link, and add a cover image. Covers are shown in black and white with the couple names on top.
- **Images wall:** Site settings → Images wall. Add your best photos; visitors can tap any of them to see it large.
- **Pre-weddings:** each shoot has a cover, a gallery and a short text.
- **FAQ:** Site settings → FAQ page. Questions are grouped by topic.
- **Team section:** Site settings → About page → Team. Each member has a name, role, experience (number first, for example "8 years", shown in the round badge), track record ("200+ weddings"), up to 3 specialties, a short bio, an Instagram handle and a 4:5 portrait. The section appears on the home page (without bios) and on the About page (with bios).
- **Hero videos:** Site settings → Contact, stats & reviews. Upload a 20–30 s muted MP4 under 6 MB, plus a poster image.
- **Remove a sample:** delete the sample entries once you have 3 or more real ones, or overwrite them and untick "Sample content".

### Photo tips
- Export at 2400 px on the long edge, JPG quality about 80, under 600 KB each.
- Always fill in **alt text**, for example "Bride in red saree during sindoor ceremony at Bhaktapur". It helps Google and screen readers.

## Hosting: GitHub Pages

**Live at https://naveens357.github.io/vibeshots-website/**

- **Code:** the whole project (docs, wireframe, site) is in the private repo `naveens357/vibeshots-website`. Pages works on a private repo with GitHub Pro; the code stays private and only the built site is public.
- **Deploys:** every push to `main` runs `.github/workflows/deploy.yml`, which builds `site/` and publishes it, in about 1–2 minutes. Do new work on a branch and merge it into `main` through a pull request. Progress shows on the repo's **Actions** tab.
- **The `/vibeshots-website/` path:** the workflow sets `SITE_URL` and `SITE_BASE`. A small build step in `astro.config.mjs` adds the base path to every link, so pages and content keep plain `/path` links.

### Forms
With no setup, the wedding and commercial forms open WhatsApp with every answer filled in, and the visitor just taps send.

To also receive them by email:
1. Sign up free at web3forms.com with your studio email and copy the access key.
2. In the content manager, go to Site settings → Contact, stats & reviews and fill in:
   - **Form service endpoint:** `https://api.web3forms.com/submit`
   - **Form service access key:** the key you copied

### Editing content
- **On your computer:** the local content manager (`npm run cms`) works as described above. Changes are saved to the files; commit and push them (or merge a PR) to publish.
- **Online at `/admin`:** GitHub sign-in needs a small OAuth helper, because GitHub Pages can't run one itself. One option is the free Cloudflare Worker "decap-proxy". Until that exists, edit locally.

### Custom domain (later)
1. Add the domain under the repo's Settings → Pages → Custom domain.
2. Point the DNS at GitHub.
3. In `.github/workflows/deploy.yml`, change `SITE_URL` to `https://yourdomain` and `SITE_BASE` to `/`.
4. Update `site_url` in `public/admin/config.yml`.

### Google
Submit `https://naveens357.github.io/vibeshots-website/sitemap-index.xml` in Google Search Console, and add the site link to your Google Business Profile.

### Netlify (alternative)
`netlify.toml` still works if you ever move to Netlify. Netlify brings built-in forms and the CMS sign-in.

## Before launch checklist
- [ ] Replace the sample stories, projects, testimonial, team and founder note.
- [ ] Put real numbers in the stats bar (Site settings).
- [ ] Replace the placeholder client names with real ones you have permission to show.
- [ ] Email is hidden for now. Once a real address works, add it in Site settings (Email) and it shows in the footer and commercial brief.
- [ ] Add a call-booking link (Cal.com or Calendly) in Site settings. Without one, "Book a call" opens WhatsApp.
- [ ] Get the logo as an SVG and replace `public/images/logo-*.png`.
- [ ] Test both forms on the live site.
