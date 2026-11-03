# 04 — Build Roadmap: Platform, Steps, Launch Checklist

## 1. Platform choice (no-code, team can update)

| Option | Design control | Ease of updating | Speed | CMS (stories, projects) | Fit |
|---|---|---|---|---|---|
| **Framer** | Very high, Figma-like | Easy once set up | Very fast (global CDN) | Yes | **Recommended** |
| Webflow | Very high | Harder; a steep learning curve | Fast | Yes, strong | Good if a web designer maintains it |
| Wix Studio | High | Easy | Medium | Yes | OK, but heavier pages |
| Squarespace | Medium (templates) | Easiest | Medium | Blog only | Many Indian studios use it, so it looks familiar |
| Showit + WordPress blog | High | Medium | Medium | Blog only | Popular with US wedding photographers |
| WordPress + Elementor | High | Medium; needs plugin upkeep | Varies | Yes | Avoid without a developer |

**Recommendation: Framer.**
- It can match the wireframe exactly: the split hero, arches, animated buttons and the bride/groom toggle.
- Your team adds a new wedding by filling in a CMS form (title, photos, venue) with no layout work.
- It loads fast on Nepali mobile data, which matters because most visitors are on phones.

Check current pricing at framer.com/pricing. You will need a paid site plan with CMS and a custom domain.

**Supporting tools**
| Need | Tool | Note |
|---|---|---|
| Client photo delivery and proofing | **Pic-Time** or **Pixieset** | Password galleries, downloads and favourites, plus print sales. Link it as "Client login". |
| Films | **Vimeo** (Standard plan or higher, no ads) or unlisted **YouTube** | Embed with a custom poster. |
| Call booking | **Cal.com** (free) or **Calendly** | 20-min consultation with Google Meet. |
| Form notifications | Framer Forms → email, plus Make/Zapier → Google Sheet | Gives one lead sheet for the whole team. |
| Analytics | Framer Analytics + Google Analytics 4 + Meta Pixel | The Meta Pixel lets you retarget Instagram ads to site visitors. |
| Search | Google Search Console + Google Business Profile | |
| Domain | `vibeshotsnepal.com` (international) + `vibeshots.com.np` | Nepali `.com.np` domains are issued through Mercantile ([register.com.np](https://register.com.np/)). Redirect one to the other. |
| Email | Google Workspace, `hello@vibeshotsnepal.com` | Looks more premium than Gmail on cards and invoices. |

## 2. Step-by-step plan

### Phase 0 — Decisions (week 1)
- [ ] Choose **one Instagram handle style**. You currently use `@vibeshotsnepal` (weddings), `@vibeshots_nepal` (commercial) and `@vibeshots.nepal` (on the flyers).
- [ ] Confirm the bios: the wedding account bio says Bhaktapur, and the commercial account bio says Kathmandu.
- [ ] Buy the domain(s).
- [ ] Get the **logo as SVG** from your designer, plus a monogram or favicon.
- [x] Confirm the package prices, add-ons and terms in `03-site-plan.md` §5 (confirmed 3 Nov 2026).
- [ ] Choose fonts: launch on the free set, or buy Canela + Neue Montreal.
- [ ] Choose the platform. Framer is the recommendation.

### Phase 1 — Content (weeks 1–3) ← the longest part
**Weddings**
- [ ] Choose **8–10 full weddings** (mix of Hindu ceremonies, a Newari wedding if you have one, different venues, both sides). Pick 40–80 final images each.
- [ ] Get written OK from each couple to feature them.
- [ ] For each wedding, write the couple names, date (BS + AD), venue, ceremonies, a 150-word story, a quote from the couple, and the vendor list.
- [ ] Choose **3–5 highlight films** and cut **one 20–30 s hero loop** (muted, no titles).
- [ ] Choose **8 ceremony hero images** (Mehendi, Haldi, Janti, Kanyadan, Sindoor, Bidaai, Reception, Pre-wedding).
- [ ] Collect **10+ testimonials** and ask past couples to leave Google reviews.

**Commercial**
- [ ] Choose **6–8 projects**, for example Dirt Temple motorsport, a travel or hotel shoot, a product shoot and an event.
- [ ] For each project, write the client, a one-line brief, what you did, the deliverables and results (if any), with 15–40 images and the film.
- [ ] Gather client logos and get permission to show them.
- [ ] Cut a **30–45 s commercial showreel**.

**Studio**
- [ ] Team photos on one simple background in the same light.
- [ ] Photos of the Sallaghari studio and the Bhaktapur streets.
- [ ] A founder story of about 200 words, written in your own voice.
- [ ] Real numbers: weddings shot, years, reviews, brands.

### Phase 2 — Design (weeks 2–4)
- [ ] Rebuild the wireframe (`wireframe/index.html`) in Framer or Figma using the tokens in `02-design-system.md`.
- [ ] Design these pages, desktop and mobile: Home, Weddings, Story, Packages, Commercial, Case study, About, Contact.
- [ ] Review with 3–5 past clients or relatives on their phones. Ask them to find the price and book a call.

### Phase 3 — Build (weeks 4–6)
- [ ] Set up the Framer CMS collections: **Wedding Stories**, **Films**, **Ceremonies**, **Commercial Projects**, **Journal**, **Testimonials**, **Packages**.
- [ ] Build the reusable components: header, footer, buttons (all states), package card, story card, arch image, WhatsApp bar.
- [ ] Add the inquiry forms with notifications to email and the lead sheet.
- [ ] Add the WhatsApp, Viber and IG links, and the Cal.com embed.
- [ ] Connect the Pic-Time or Pixieset client login.

### Phase 4 — SEO and tracking (week 6)
- [ ] Write a page title and meta description for every page, in English with a Nepali keyword.
- [ ] Write alt text for every image.
- [ ] Add the LocalBusiness schema.
- [ ] Set up Search Console, submit the sitemap, and add GA4 and the Meta Pixel.
- [ ] Create or claim the Google Business Profile with the website link, photos and service list.
- [ ] Publish 2 journal posts before launch.

### Phase 5 — Test and launch (week 7)
- [ ] Test on real phones (Android Chrome, iPhone Safari) on 4G data. The home page should load in under 3 s.
- [ ] Test every form and button, and the WhatsApp and Viber links on both a phone and a laptop.
- [ ] Check spelling, prices and phone numbers on every page.
- [ ] Test the forms with a real inquiry.
- [ ] Check the 404 page, favicon, and social share image (Open Graph).
- [ ] Go live and put the link in all Instagram bios, Google Business Profile, WhatsApp Business profile and email signature.
- [ ] Announce it with an Instagram reel tour of the site.

### Phase 6 — Grow (ongoing)
| Every… | Do |
|---|---|
| Week | Post 1–2 Google Business photos. Reply to every review. |
| Month | Add 2 wedding stories and 1 commercial project. Publish 1 journal post. |
| Season (before Mangsir, Magh, Falgun, Baisakh) | Update the early-bird banner. Run Meta ads to the packages page. |
| Year | Enter WeddingSutra and Fearless/Junebug awards. Update prices. Refresh the hero film. |

**Lead tracking:** in the lead sheet, record the source (Website, Instagram, WhatsApp, Referral) and whether the lead booked. After 3 months, compare channels.

## 3. Rough budget (to confirm)
| Item | Estimate |
|---|---|
| Domain `.com` | about USD 12–20 a year |
| Domain `.com.np` | free through Mercantile, with the documents they ask for |
| Framer site plan with CMS | check framer.com/pricing |
| Pic-Time / Pixieset | free tier to start, paid tiers later |
| Google Workspace | per user per month |
| Fonts (optional) | Canela + Neue Montreal web licences, roughly USD 150–400 one-off |
| Vimeo | optional, or use YouTube unlisted for free |

## 4. Open questions for you
1. What are your real numbers (weddings shot, years active, Google rating and review count)?
2. Do you have a Newari wedding in the archive? It is the strongest Bhaktapur differentiator.
3. Who will be featured on the team page?
4. Which commercial clients can we name publicly?
5. Do you need a Nepali-language PDF price list to send on WhatsApp? It is easy to make from the packages page.
