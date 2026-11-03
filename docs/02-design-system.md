# 02 — Design System

This is the visual language for the site. Values are written so a Framer or Figma file can be built straight from them. The live version is in `wireframe/index.html` under the **Design System** tab.

## 1. Brand idea

**"Two worlds, one lens."**
- **Weddings world:** warm ivory paper, deep ink, sindoor maroon, marigold gold. It feels slow, editorial and emotional. The red saree in the photos is the hero colour, so the interface never competes with it.
- **Commercial world:** asphalt black, white and the logo orange. It feels fast, bold and wide-type, like motorsport.
- **Shared:** the logo, the orange dot (taken from the "i" in *vibeshots*), the camera-arc line, and the button system.

**Tagline options**
1. *Every vibe, every vow.* (recommended for the wedding side)
2. *Stories from the heart of Bhaktapur.*
3. *Made in Bhaktapur. Shot for the world.* (commercial side)

## 2. Logo use

| File | Use |
|---|---|
| `wireframe/assets/logo-original.png` | The source you sent (white background). |
| `wireframe/assets/logo-dark.png` | Transparent background, black text. Use on ivory and white. |
| `wireframe/assets/logo-light.png` | Transparent background, white text with orange camera. Use on black and on photos. |

- **Ask your logo designer for an SVG.** The PNGs were cut from a 1800 px image and are fine for the wireframe, not for print or retina headers.
- **Clear space:** the height of the orange dot on every side.
- **Minimum width:** 120 px on the web, 30 mm in print.
- **Header:** the wordmark is used without "NEPAL" at 28–32 px high on scroll, and the full lockup in the footer.
- **Monogram / favicon:** the orange dot plus the camera arc, or a "v" with the dot. Ask the designer for this too.
- **Never:** recolour the orange, stretch the logo, add shadows, or put it on busy photo areas without a dark gradient behind it.

## 3. Colour

### Weddings palette
| Token | Hex | Use |
|---|---|---|
| `--ivory` | `#F6F0E6` | Page background |
| `--paper` | `#FBF8F2` | Cards, form fields |
| `--ink` | `#0B0B0C` | Text, primary buttons (matches logo black `#050708`) |
| `--ink-soft` | `#4A4542` | Body text |
| `--sindoor` | `#7A1820` | Accent headings, Devanagari, hover states |
| `--marigold` | `#C8962E` | Hairlines, ornaments, small icons. Never body text, because contrast is too low. |
| `--orange` | `#F15A2B` | Logo orange. Only the dot, badges and one key CTA per screen. |
| `--line` | `#E2D8C8` | Borders and dividers |

### Commercial palette
| Token | Hex | Use |
|---|---|---|
| `--asphalt` | `#0A0A0B` | Background |
| `--carbon` | `#17171A` | Cards |
| `--chalk` | `#F4F4F2` | Text |
| `--steel` | `#8A8A90` | Secondary text |
| `--orange` | `#F15A2B` | CTAs, the numbers in stats, the active filter |

**Rules**
- Photos carry the colour. The UI stays neutral.
- The sindoor maroon is a darker, quieter cousin of saree red, so it sits next to bridal photos without clashing.
- Text contrast meets WCAG AA. Ink on ivory is about 17:1 and ink-soft on ivory is about 8:1. Orange on asphalt is about 6:1, so it is fine for big text and buttons.

## 4. Typography

### Recommended premium set (paid licences)
| Role | Typeface | Why | Licence |
|---|---|---|---|
| Display serif (weddings) | **Canela** by Commercial Type | Soft, high-contrast editorial serif used by luxury fashion and bridal brands. Beautiful in italic for couple names. | commercialtype.com, about USD 50–150 per style for web |
| Alternative display | **PP Editorial New** by Pangram Pangram | Sharper, more modern. Free for personal trials and paid for commercial use. | pangrampangram.com |
| UI / body | **Neue Montreal** by Pangram Pangram | Clean grotesk, quiet next to the serif. | pangrampangram.com |
| Commercial display | **Druk Wide** by Commercial Type | Heavy, wide and fast. Echoes the bold logo wordmark. | commercialtype.com |
| Devanagari accent | **Rozha One** (free, Google) or **Tiro Devanagari Hindi** (free, Google) | Rozha is high-contrast, like Canela, and fits the wedding headers. | Google Fonts |

### Free stand-ins (used in the wireframe and fine for launch)
| Role | Google Font |
|---|---|
| Display serif | **Cormorant Garamond** (500/600, plus italic) |
| UI / body | **Manrope** (400/500/600/700) |
| Commercial display | **Archivo** variable, width 125, weight 800–900 (close to the logo's heavy sans) |
| Devanagari | **Rozha One** for headings, **Mukta** for body Nepali |

If budget is tight, launch on the free set and switch to Canela and Neue Montreal later. Only the font tokens change.

### Type scale (desktop / mobile)
| Token | Size | Line height | Font |
|---|---|---|---|
| `display-xl` | 96 / 52 px | 1.0 | Serif 500, tracking -1% |
| `display-l` | 64 / 40 px | 1.05 | Serif 500 |
| `h2` | 44 / 32 px | 1.1 | Serif 500 |
| `h3` | 28 / 22 px | 1.2 | Serif 600 |
| `eyebrow` | 12 px | 1.2 | Sans 600, uppercase, tracking 0.24em |
| `body-l` | 19 / 17 px | 1.6 | Sans 400 |
| `body` | 16 px | 1.6 | Sans 400 |
| `caption` | 13 px | 1.4 | Sans 500 |
| `comm-display` | 120 / 56 px | 0.9 | Archivo 900, width 125, uppercase |
| `deva-accent` | 0.9 × the heading it sits beside | 1.3 | Rozha One, sindoor colour |

### Devanagari accent rule
The site is in English. Short Nepali words act as ornaments and emotional cues, never as the only label:
- Above section headings, for example **शुभ विवाह** over "Wedding Stories", **संस्कार** over "Ceremonies", **हाम्रो कथा** over "About us", **सम्पर्क** over "Contact".
- In the closing line of the footer, **धन्यवाद**.
- Always pair with English, so diaspora and foreign clients are not lost.

## 5. Spacing, grid, shape

- **Base unit:** 8 px. Section padding is 128 px on desktop and 72 px on mobile.
- **Grid:** 12 columns, 1320 px max width, 24 px gutters, 16 px mobile side gutters.
- **Radius:** 2 px on photos (they should feel like prints), 999 px on buttons (pills), 16 px on cards.
- **The arch:** a frame with a rounded top, taken from the carved temple windows and doors of Bhaktapur Durbar Square. Use it for portrait photo masks in the hero, ceremony cards and the About photo. It is the single strongest "Nepali" cue and stays elegant.
- **Ornament:** a thin marigold hairline with a small diamond in the middle, like a toran or a dhaka border, used between major sections. Keep it subtle and never use a full dhaka pattern as a background.

## 6. Buttons

Every button is a pill, 52 px tall (44 px for small), 28 px side padding, `Manrope 600`, 14 px, tracking 0.04em.

| Button | Default | Hover | Pressed | Use |
|---|---|---|---|---|
| **Primary: "Dot"** | Ink fill, ivory text, a 8 px **orange dot** on the left | The dot grows into a full orange circle behind an arrow icon, and the label slides 4 px right (250 ms, ease-out-expo) | Scale 0.98 | The main CTA on each screen, such as "Check your date" |
| **Secondary: Outline** | 1 px ink border, ink text | Ink fill sweeps in from left to right, and the text becomes ivory | Scale 0.98 | "View packages", "Watch film" |
| **Ghost link** | Ink text with a 1 px underline at 30% opacity | Underline draws to 100% from the left, and the arrow nudges 4 px | — | Inside text, "See full story →" |
| **WhatsApp** | Paper fill, ink text, a small green `#25D366` glyph | Border becomes green, and the glyph bounces once | Scale 0.98 | Package cards, contact |
| **Shutter (icon)** | 56 px circle, ink | The aperture icon rotates 60° | — | Play film, open lightbox |
| **Commercial primary** | Orange fill, black text, square corners (2 px), Archivo 800 uppercase | A black arrow block slides in from the right | Scale 0.98 | Commercial pages only, so the two worlds feel different |

**States for all buttons:**
- **Focus:** a 2 px orange outline with a 3 px offset. Never remove it.
- **Disabled:** 40% opacity, no hover.
- **Loading:** the label fades and three dots pulse.
- **Touch target:** at least 44 × 44 px.

The `wireframe/index.html` Design System tab shows all buttons working.

## 7. Photo & video rules

- **Hero video:** a 20–30 s muted loop, under 6 MB in 1080p WebM/MP4, with a poster image. Mix the sindoor moment, laughter during Haldi, Bhaktapur light and a drone shot of the venue.
- **Aspect ratios:**
  - Portrait 4:5 for people.
  - Landscape 3:2 for scenes.
  - 16:9 for films.
  - 21:9 for commercial heroes.
- **Edit consistency:** one colour grade across the site. Warm skin, true reds, deep but not crushed blacks. Red sarees go orange or magenta in bad edits, so check reds on a calibrated screen.
- **Selection:** each story shows 40–80 images. The homepage shows the best 1%.
- **Faces and consent:** get written consent from couples before you publish (add a line to the booking contract).
- **Delivery:** use Framer's or the CDN's automatic WebP/AVIF. Upload at 2400 px long edge, about 80% quality, so each image is under 600 KB.
- **Films:** host on Vimeo (no ads, clean player) or as an unlisted YouTube video. Show a custom poster and play button, and never the default embed until it is clicked.

## 8. Motion

- **Feel:** slow, like a film. Fades and small rises (16 px, 600 ms, ease-out).
- **Image reveal:** a clip-path wipe from the bottom on scroll.
- **Hero:** the headline words fade in one by one, 80 ms apart.
- **Hover on stories:** the image zooms 1.04, and the couple names slide up.
- **Commercial pages:** faster (300 ms), with a horizontal scroll marquee of client names.
- **Respect `prefers-reduced-motion`:** turn off every motion above for those users.

## 9. Iconography

Use thin 1.5 px line icons ([Phosphor Icons](https://phosphoricons.com/), Light weight). Brand glyphs for WhatsApp, Viber, Instagram, TikTok and YouTube come from [Simple Icons](https://simpleicons.org/).

## 10. Voice & copy

- **Weddings:** warm, sure and personal. Talk to the families as well as the couple. Example: "From the first haldi to the last bidaai, we're there and quietly ready."
- **Commercial:** short, confident, verbs first. Example: "Speed, dust, glory. Shot clean."
- Never use "best in Nepal", fake urgency, or overclaims. Proof (numbers, names, reviews) does that job better.
