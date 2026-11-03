# Vibeshots Nepal — Website Plan

A premium website for **Vibeshots Nepal**, a wedding and commercial photography and film studio in Sallaghari, Bhaktapur. It covers Hindu and Newari weddings across the Kathmandu Valley, plus motorsport, automotive, travel and brand work.

This folder holds the research, the design system, the full site plan with packages, the build roadmap, and a clickable hi-fi wireframe. No production code yet.

## Contents

| File | What it is |
|---|---|
| [docs/01-research.md](docs/01-research.md) | Competitor review of Nepal, India and international studios, with every reference link, plus what we borrow and the gaps we fill |
| [docs/02-design-system.md](docs/02-design-system.md) | Brand idea, logo rules, colours, premium fonts with free stand-ins, type scale, button specs, photo and motion rules, voice |
| [docs/03-site-plan.md](docs/03-site-plan.md) | Goals, audiences, sitemap, page-by-page layouts, **packages and prices**, travel zones, payment terms, inquiry forms, SEO |
| [docs/04-build-roadmap.md](docs/04-build-roadmap.md) | Platform choice (Framer), tools, a step-by-step checklist by phase, budget, open questions |
| [wireframe/index.html](wireframe/index.html) | A clickable wireframe: Home, Packages, Wedding story, Commercial, Contact, Design system |
| `wireframe/assets/` | Logo: the original, plus transparent dark and light cut-outs |
| [site/](site/README.md) | **The real website**: Astro + Decap CMS. See `site/README.md` to run it, edit content, and go live. |

## Viewing the wireframe

```bash
node wireframe/serve.js
```

Then open http://localhost:5178. Use the dark bar at the top to switch pages, and the **Notes** checkbox to show or hide the numbered design notes. You can also open `wireframe/index.html` directly in a browser.

The coloured gradient blocks are photo and video placeholders. Each label says what shot goes there. Couple names, reviews and stats are **samples**, so replace them with real ones before launch.

## Key decisions

1. **Two worlds, one lens.** Weddings use warm ivory, ink and sindoor maroon with an elegant serif. Commercial uses black and the logo orange with wide heavy type. The split "two doors" home hero lets each visitor pick their world in one click.
2. **Nepali feel without kitsch:**
   - Arch-shaped photo frames taken from the Bhaktapur Durbar Square windows.
   - Devanagari accent words (शुभ विवाह, संस्कार, धन्यवाद).
   - Marigold "toran" dividers.
   - Prices in lakh format (1,18,000).
   - Dates in both BS and AD.
3. **Packages built from your event prices.** Saath, Mangal (most popular), Shubha and Sampurna save 5,000 to 28,000. There is an extra **5% early bird** for bookings 90+ days ahead.
4. **Outside-Valley pricing published openly:**
   - Zone B (Pokhara, Chitwan…) is **+15%**.
   - Zone C (far or by flight) is **+25%**.
   - In both zones the family also covers travel, stay and meals.
5. **All four contact channels:** WhatsApp (with the package name pre-filled), Viber, the inquiry form, an Instagram DM link and a call booking. On mobile a sticky bottom bar shows WhatsApp, Call and Check date.
6. **Platform: Astro + Decap CMS on Netlify.** Your team adds weddings through a web admin at `/admin` without code, and hosting starts on Netlify's free plan. This replaced the earlier Framer recommendation so the site could be built here. Client galleries go on Pic-Time or Pixieset, and films on Vimeo or YouTube.

## Packages at a glance (NPR, Kathmandu Valley)

| Package | Events | Bride side | Groom side |
|---|---|---|---|
| **Saath** | Wedding + Reception | 70,000 | 75,000 |
| **Mangal** ★ | Haldi/Mehendi + Pre-wedding + Wedding + Reception | 1,18,000 | 1,23,000 |
| **Shubha** | Mangal + Engagement | 1,48,000 | 1,53,000 |
| **Sampurna** | Everything, with both families on the wedding day (2 teams) | 1,80,000 (both) | |
| **Heritage** | Fine-art premium tier, by application | from 2,75,000 | |

Full breakdown, add-ons and terms: [docs/03-site-plan.md §5](docs/03-site-plan.md).

## Next steps

1. Answer the open questions in [04-build-roadmap.md §4](docs/04-build-roadmap.md): real stats, a Newari wedding in the archive, and client names.
2. Fix the three Instagram handles to one naming rule, and get the logo as an SVG.
3. Start content selection (Phase 1). It takes the longest.
4. Build in Framer from the wireframe and the design system.

## Research log

| Date | Step |
|---|---|
| 2026-11-03 | Asked the scoping questions: pricing → full tiers, language → English with Devanagari accents, contact → WhatsApp + Viber + form + IG + calls, upkeep → no-code |
| 2026-11-03 | Received the event price flyers. Built the packages with bundle discounts, an early bird, and travel zones. |
| 2026-11-03 | Reviewed 4 Nepali studio sites, 6 Indian sites (3 loaded), 8 international sites, and 2 automotive photographers. See `01-research.md`. |
| 2026-11-03 | Extracted the logo colours: orange `#F15A2B`, black `#050708`. Cut transparent logo versions. |
| 2026-11-03 | Wrote the design system, site plan and roadmap. Built and checked the wireframe on desktop and on a 375 px mobile width. |
| 2026-11-03 | Vibeshots confirmed all package prices, add-ons, Heritage tier, travel zones and payment terms. |
| 2026-11-03 | Built the site in `site/` with Astro 7 and Decap CMS: 31 pages, Netlify forms, sitemap, schema.org data, placeholder media. Changed the platform from Framer to Astro + CMS so the build could be done here. |
