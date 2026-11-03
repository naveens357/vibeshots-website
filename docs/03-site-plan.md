# 03 — Site Plan: Sitemap, Pages, Packages, Forms

## 1. Goals

1. **Get more wedding bookings** from Kathmandu Valley families, and from NRIs booking from abroad.
2. **Win commercial work** from motorsport, automotive, travel, hospitality and product brands.
3. **Cut repeat questions** about price, travel and delivery by publishing them clearly.
4. **Rank on Google** for "wedding photographer Bhaktapur / Kathmandu", ceremony terms and venues.

**Success measures (first 6 months):** 30+ qualified inquiries a month, more than 25% of inquiries from the website rather than Instagram, top 5 on Google for "wedding photographer Bhaktapur".

## 2. Audiences

| Who | What they need | What convinces them |
|---|---|---|
| Bride's or groom's family (often the parents decide and pay) | Price, coverage per ceremony, trust | Clear packages, Nepali touches, real full weddings, phone and WhatsApp |
| The couple (25–32, on Instagram) | Style, films, vibe | Hero film, couple stories, reels |
| NRI / diaspora couples marrying in Nepal | Trust from far away, video calls, English | Reviews, a call booking, clear payment terms |
| Brands and agencies (marketing managers) | Speed, quality, client list, usage rights | Case studies, a brand logo wall, Stills/Motion, a quick brief form |
| Event and motorsport organisers | Action coverage, fast turnaround | Motorsport reel, "official photographer of" line |

## 3. Sitemap

```
/                         Home (split: Weddings + Commercial)
/weddings                 Weddings overview
  /weddings/stories       All wedding stories (filter: ceremony, venue, season)
  /weddings/stories/[slug]  One wedding story (CMS)
  /weddings/films         Wedding films
  /weddings/pre-wedding   Pre- and post-wedding shoots
  /weddings/ceremonies/[slug]  Haldi & Mehendi, Janti & Kanyadan, Sindoor & Bidaai,
                               Reception, Newari Wedding, Bratabandha, Gunyo Cholo (SEO pages)
/packages                 Packages and prices (bride / groom / both toggle)
/commercial               Commercial overview (Stills / Motion switch)
  /commercial/[slug]      Case study (CMS)
/about                    Our story, team, studio in Sallaghari
/journal                  Blog (SEO: venue guides, saait dates, tips)
  /journal/[slug]
/contact                  Inquiry form + WhatsApp, Viber, Instagram, call booking + FAQ
/gallery                  "Client login", which links out to Pic-Time or Pixieset
/terms  /privacy          Booking terms, privacy
```

**Main navigation (desktop):** Logo · Weddings · Commercial · Films · Packages · About · Journal · `[Check your date]` button · WhatsApp icon.

**Mobile:** Logo · menu icon · a sticky bottom bar with **WhatsApp | Call | Check date**. Nepali clients act from their phones, so this bar is the most important element on mobile.

## 4. Page by page

### 4.1 Home
1. **Header**, transparent over the hero, turns ivory with the dark logo on scroll.
2. **Split hero, "Two doors".** The left 60% plays the wedding film loop. Its headline is *Every vibe, every vow.* with a शुभ विवाह accent and a button "Explore weddings". The right 40% is a black panel with a motorsport loop, *MADE IN BHAKTAPUR. SHOT FOR THE WORLD.* and "Commercial work". On hover each side widens to 70%. On mobile the two stack, with weddings first.
3. **Proof bar:** "200+ weddings · 4.9★ on Google (80 reviews) · 7 years · Bhaktapur, Nepal". Replace with real numbers.
4. **Intro and manifesto.** A short paragraph, with an arch-framed portrait beside it.
5. **Featured wedding stories.** Three large cards with couple names in italic serif, the venue, the season and ceremony tags.
6. **Ceremonies we cover.** A horizontal scroll of arch cards: Mehendi, Haldi, Janti, Kanyadan, Sindoor, Bidaai, Reception, Pre-wedding.
7. **Featured film.** A full-width poster with a shutter play button. The film opens in a lightbox.
8. **Commercial strip (dark).** Three project tiles plus a marquee of client names.
9. **Packages teaser.** Three cards (Saath, Mangal, Shubha) with prices and "See all packages".
10. **How booking works.** Four steps: Check your date → Free call → Lock with 30% → Shoot day and delivery.
11. **Testimonial.** A big quote with the couple's photo and the Google rating.
12. **Instagram strip.** Six latest posts and "@vibeshotsnepal".
13. **Final CTA.** *Saait fixed? Let's lock your date.* Buttons: Check your date · WhatsApp · Viber · Book a call.
14. **Footer.** Full logo, address (Sallaghari, Bhaktapur), phones, social links, site links, धन्यवाद.

### 4.2 Weddings overview
Hero still → approach (documentary + portrait) → stories grid with filters → ceremonies → films → pre-wedding → packages teaser → FAQ → CTA.

### 4.3 Wedding story (CMS template)
- **Hero:** a full-bleed image, *Aashma & Rohan*, and "Bhaktapur Durbar Square · Mangsir 2082".
- **Facts row:** ceremonies covered, venue, team, package.
- **Story text:** about 150 words, which also helps SEO.
- **Gallery:** 40–80 images in a mix of rows (one full, two half, three thirds) with the films in between.
- **Couple quote.**
- **Vendor credits:** venue, makeup, decor, mehendi artist, attire. Each is linked, so vendors share the post.
- **Next / previous story, then a CTA.**

**CMS fields:** title, slug, couple names, date (BS + AD), venue, city, ceremonies (multi), package, hero image, gallery images, film URL, story text, quote, vendor list, SEO title and description.

### 4.4 Packages
See §5. Layout: a bride / groom / both toggle → tier cards → early-bird banner → à-la-carte table → add-ons → travel zones → payment and delivery terms → FAQ → CTA.

### 4.5 Commercial
- **Dark world.**
- **Hero:** a 21:9 motorsport loop, a wide heavy headline, and a "Start a project" button.
- **Switch:** **Stills | Motion**.
- **Sector filters:** Motorsport · Automotive · Travel & Hospitality · Brands & Product · Events.
- **Project grid:** each tile shows the client, the project and the type.
- **Client logo wall:** greyscale logos that turn to colour on hover.
- **Services:** Campaign stills, TVC and brand films, event coverage, social content packs, drone.
- **Process:** Brief → Plan → Shoot → Edit → Deliver.
- **Brief form** (short; see §6.2).

**Case study:**
1. A title and a one-line credit, for example "Dirt Temple × Vibeshots — Season 3 coverage" (Amy Shore style).
2. Brief, challenge and what we did, in three short blocks.
3. A full image run and the film.
4. Results, if known (reach, views).
5. Credits.
6. Next project.

### 4.6 About
- **हाम्रो कथा / Our story:** Bhaktapur roots, why "vibe".
- **Founder note:** first person, with a photo.
- **Team cards:** photo, role and one fun line.
- **Studio:** the Sallaghari location, a map and photos.
- **Gear and approach:** briefly.
- **Awards and press,** once they exist.

### 4.7 Journal (SEO engine)
Post ideas to start:
- "Best pre-wedding locations in Bhaktapur (with entry rules for Durbar Square)"
- "Auspicious wedding dates (saait) 2083: month by month"
- "Haldi & Mehendi photo checklist for Nepali families"
- "Newari wedding rituals: what we capture"
- "Wedding venues in Kathmandu Valley: a photographer's guide"
- "How to plan a wedding timeline so photos aren't rushed"
- "What to wear for your pre-wedding shoot"

### 4.8 Contact
Two-column: the form on the left, with WhatsApp, Viber, Instagram DM, a call booking (Cal.com), the phones, the map and the studio hours on the right. An FAQ accordion goes below.

## 5. Packages & pricing

**Status:** all prices, add-ons, travel zones and payment terms in this section were confirmed by Vibeshots on 3 November 2026.

### 5.1 Your current event prices (from your flyers)
| Event | Coverage | Team | Includes | Price (NPR) |
|---|---|---|---|---|
| Haldi / Mehendi | 6 h | 1 photographer + 1 videographer | Edited photos (64 GB pendrive + Google Drive), full cinematic highlight video | 30,000 |
| Engagement | 6–7 h | 1 + 1 | Edited photos, highlight video, 12×18 frame, 250+ photo album | 38,000 |
| Wedding — Bride side | 7–8 h | 1 + 1 | Edited photos, highlight video, 250+ photo album, 12×18 frame | 39,999 |
| Wedding — Groom side | 9–10 h | 1 + 1 | Edited photos, highlight video, 250+ photo album, 12×18 frame | 44,999 |
| Wedding — Both sides | 9–10 h | 2 + 2 | Two sets of everything (2 highlights, 2 albums, 2 frames) | 80,000 |
| Reception (incl. bride reception) | 7–8 h | 1 + 1 | Edited photos, highlight video, in-venue photoshoot | 35,000 |
| Pre / post-wedding shoot | 3 h | 1 + 1 | Edited photos, highlight video | 25,000 |

**Recommendation:** on the website, round to **40,000** and **45,000**. Round numbers read as premium and are easier to compare. The flyer-style 39,999 is fine for Instagram sale posts.

### 5.2 Wedding packages (bundles of the events above)
Each bundle is the sum of its events minus a bundle discount. The more events, the bigger the saving (about 7% for 2 events, about 9% for 4, about 12% for 5, about 13.5% for both sides). Names use Nepali words with clear English sub-labels.

| | **Saath** · Essential | **Mangal** · Signature ★ Most popular | **Shubha** · Grand | **Sampurna** · Both families |
|---|---|---|---|---|
| Events | Wedding day + Reception | Haldi/Mehendi + Pre-wedding shoot + Wedding day + Reception | Engagement + Haldi/Mehendi + Pre-wedding + Wedding + Reception | Engagement + Haldi/Mehendi + Pre-wedding + **Both-side wedding (2 teams)** + Reception |
| Team per event | 1 photographer + 1 videographer | 1 + 1 | 1 + 1 | 1 + 1, and **2 + 2 on the wedding day** |
| Photos | All edited, pendrive + Drive | Same | Same | Same |
| Films | A highlight film per event | A highlight per event + a **combined wedding film (4–6 min)** | Same as Mangal + an engagement film | Two wedding films (one per side) + all event highlights |
| Albums (250+ photos) | 1 | 1 | 2 (wedding + engagement) | 3 (bride side, groom side, engagement) |
| 12×18 frames | 1 | 1 | 2 | 3 |
| Sneak peek in 48 h | ✓ | ✓ | ✓ | ✓ |
| **Bride side: sum of events** | 75,000 | 130,000 | 168,000 | — |
| **Bride side: package price** | **70,000** | **118,000** | **148,000** | — |
| **Groom side: sum of events** | 80,000 | 135,000 | 173,000 | — |
| **Groom side: package price** | **75,000** | **123,000** | **153,000** | — |
| **Both families: sum / price** | — | — | — | 208,000 / **180,000** |
| You save | 5,000 | 12,000 | 20,000 | 28,000 |

How the sums were built (bride side; the groom side uses 45,000 for the wedding day):
- Saath = 40,000 wedding + 35,000 reception = 75,000.
- Mangal = 30,000 haldi + 25,000 pre-wedding + 40,000 wedding + 35,000 reception = 130,000.
- Shubha = Mangal + 38,000 engagement = 168,000.
- Sampurna = 38,000 + 30,000 + 25,000 + 80,000 both-side wedding + 35,000 reception = 208,000.

### 5.3 Vibeshots Heritage (premium, by application)
This is a fine-art tier for a few weddings each season, in the style of House on the Clouds' sub-brand.
- **Team:** 2 photographers and 2 cinematographers at every event.
- **Extras:** drone (where allowed), a same-day-edit reel at the reception, a 10–15 min documentary film, a 40-page lay-flat heirloom album, a parents' album, and a 24×36 canvas.
- **Pricing:** from **NPR 275,000**.
- **Limit:** 8 weddings per season, which makes it a scarcity signal.

### 5.4 Early-bird offer
- **Extra 5% off any package** when the date is locked with the 30% advance **at least 90 days before the first event**.
- **Example:** Mangal (bride side) drops from 118,000 to **112,100**. Show it on the site as "Early bird: NPR 112,100".
- **Optional, for the off-season** (Jestha–Bhadra, roughly June to September): an extra 5%. Keep it for later, since it can teach clients to wait.
- **Display:** a banner on the packages page with a live countdown to the next main season cut-off, for example "Book by 15 Kartik for Mangsir weddings". Use real dates only, never fake timers.

### 5.5 À la carte (single events)
Show the table in §5.1 with rounded prices, so families who need one or two events can still book.

### 5.6 Add-ons
| Add-on | NPR |
|---|---|
| Extra hour of coverage (per event) | 4,000 |
| Extra photographer (per event) | 12,000 |
| Extra videographer (per event) | 15,000 |
| Drone coverage (per event, subject to local drone rules and permission) | 10,000 |
| Same-day edit reel, shown at the reception | 8,000 |
| Extra 250+ photo album | 12,000 |
| Extra 12×18 frame | 3,500 |
| 24×36 canvas print | 9,000 |
| Live streaming for relatives abroad (per event) | 15,000 |

### 5.7 Outside-Valley travel
Prices above cover **Zone A**. Outside the Valley, the coverage price rises by a zone percentage, and the client also covers crew travel, stay and meals.

| Zone | Places (examples) | Coverage price | Travel, stay, meals |
|---|---|---|---|
| **A — Kathmandu Valley** | Kathmandu, Lalitpur, Bhaktapur, Kirtipur | No change | Included |
| **A+ — Valley edge** | Banepa, Dhulikhel, Panauti, Nagarkot, Chitlang | No change | Transport NPR 4,000 per day |
| **B — Up to about 6 h by road** | Pokhara, Chitwan, Gorkha, Hetauda, Nuwakot | **+15%** | Client covers transport, rooms (1 per 2 crew) and meals |
| **C — Far or by flight** | Butwal, Biratnagar, Janakpur, Birgunj, Dharan, Nepalgunj, Dhangadhi, hill districts | **+25%** | Client covers transport (flights where the road takes more than 8 h), rooms and meals. Travel days are charged at 50% of the day rate. |
| **International** | India, Bhutan, Thailand, Dubai and more | Custom quote | Client covers visas, flights and stay |

**Example:** Mangal bride side in Pokhara is 118,000 × 1.15 = **135,700**, plus the crew's travel and stay.

### 5.8 Payment, delivery and booking terms (publish on the packages page)
- **Booking:** a **30% advance** locks the date. It is non-refundable but can be moved once to a new date within 12 months.
- **Then:** 50% on the first event day, and 20% before the album and final delivery.
- **Payment methods:** bank transfer, eSewa, Khalti, Fonepay QR, or cash.
- **Delivery:**
  - 15–20 sneak-peek photos within **48 h**.
  - The full edited gallery in **3–4 weeks**.
  - Highlight films in **4–6 weeks**.
  - The album design proof 2 weeks after you select photos, and printing in 2–3 weeks.
- **Raw files:** not included. Available on request for a fee.
- **Usage:** Vibeshots may use selected images for its portfolio unless the couple opts out in the contract.

### 5.9 Packages page FAQ
- Can we mix events that aren't in a package?
- What happens if our ceremony runs over time?
- Do you cover Newari, Brahmin, Chhetri, Madhesi and Tamang weddings?
- Do both photographer and videographer stay the whole time?
- Can relatives abroad watch live?
- How many photos will we receive? (A typical answer is 600–1,200 edited photos per wedding day.)
- Do you travel outside Nepal?

## 6. Inquiry flows (all four channels you chose)

### 6.1 Wedding inquiry form
| Field | Type | Required |
|---|---|---|
| Your name | text | ✓ |
| Partner's name | text | |
| You are the… | Bride / Groom / Family member / Planner | ✓ |
| Phone (WhatsApp / Viber) | tel, +977 by default | ✓ |
| Email | email | |
| Which side do we cover? | Bride side / Groom side / Both | ✓ |
| Events and dates | checkboxes (Engagement, Haldi/Mehendi, Pre-wedding, Wedding, Reception, Other), each with a date picker in **BS or AD** | ✓ |
| Venue or city | text | ✓ |
| Package of interest | Saath / Mangal / Shubha / Sampurna / Heritage / Not sure | |
| Budget range | Under 75k / 75–125k / 125–175k / 175k+ | |
| How did you hear about us? | Instagram / Facebook / TikTok / Google / Friend / Venue / Other | |
| Anything else? | textarea | |
| Best way to reply | WhatsApp / Viber / Call / Email | ✓ |

After submitting, show a thank-you screen with "We reply within 2 hours, 9am–8pm" and a "Message us on WhatsApp now" button.

### 6.2 Commercial brief form
Fields: name, company, email, phone, project type (Stills / Film / Both), sector, shoot dates, location, deliverables, usage (social, web, print, TV), budget range, links or references, message.

### 6.3 WhatsApp and Viber
- **WhatsApp:** `https://wa.me/9779862185128?text=Hi%20Vibeshots%2C%20I%27m%20interested%20in%20the%20Mangal%20package`. Each package card pre-fills its own name.
- **Viber:** `viber://chat?number=%2B9779862185128`. Desktop users without Viber should see a fallback that shows the number.
- **Second number:** 9808807033 as an alternate on the contact page.

### 6.4 Instagram DM
`https://ig.me/m/vibeshotsnepal`, shown on the contact page and in the footer.

### 6.5 Call booking
Cal.com (free) or Calendly with a 20-minute "Wedding consultation" event, including a Google Meet link for NRIs. Show it embedded on `/contact` and in a modal from the "Book a call" buttons.

### 6.6 "Check your date" tool
A small modal:
1. Pick a date (BS or AD toggle).
2. Pick a city.
3. The result says "Good news — likely available. Lock it on WhatsApp", or "Popular saait, few slots left".

At launch, run this manually: the result tells them to WhatsApp you. Later it can connect to a Google Calendar.

## 7. SEO plan

- **Primary keywords:**
  - wedding photographer Bhaktapur
  - wedding photographer Kathmandu
  - wedding videography Nepal
  - pre-wedding shoot Bhaktapur
  - Newari wedding photography
  - commercial photographer Nepal
  - motorsport photographer Nepal
- **Nepali keywords** (in meta descriptions and in the Nepali price summary): विवाह फोटोग्राफी, विवाह भिडियो, भक्तपुर.
- **Pages:**
  - Every ceremony page.
  - Venue guides (Hyatt Regency, Soaltee, Dwarika's, Hotel Annapurna, Bhaktapur Durbar Square, Changu Narayan, Nagarkot resorts).
  - One page per city in Zone B (Pokhara and Chitwan weddings).
- **Technical:**
  - Fast images.
  - Schema.org `LocalBusiness` / `ProfessionalService` with address, phone, price range and reviews.
  - An `ImageObject` alt text on every image, for example "Bride in red saree during sindoor ceremony at Bhaktapur".
  - An XML sitemap submitted to Google Search Console.
- **Off-site:**
  - Google Business Profile with weekly photo posts. Ask every couple for a review on the day you deliver.
  - Listings on Wezoree, MyWed and WedMeGood.
  - Vendor backlinks through credit swaps.
