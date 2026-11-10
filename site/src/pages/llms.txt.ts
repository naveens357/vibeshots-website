import type { APIRoute } from 'astro';
import site from '../data/site.json';
import services from '../data/services.json';
import packages from '../data/packages.json';

// Plain-text summary for AI assistants (llmstxt.org), built from the same data as the site.
const np = (n: number) => n.toLocaleString('en-IN');

export const GET: APIRoute = ({ site: siteUrl }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const url = (p: string) => new URL(`${base}${p}`, siteUrl).toString();
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `Studio: ${site.address}. Phone / WhatsApp: +977 ${site.phonePrimary}, +977 ${site.phoneSecondary}. Instagram: @${site.instagramWeddings} (weddings), @${site.instagramCommercial} (commercial). Hours: ${site.hours}.`,
    '',
    '## Services',
    ...services.groups.flatMap((g) => g.items.map((i) => `- [${i.name}](${url(i.link)}): ${i.text}`)),
    '',
    '## Wedding packages (NPR)',
    ...packages.tiers.map((t) => `- ${t.name} (${t.label}): bride side ${np(t.bride.price)}, groom side ${np(t.groom.price)}, both families ${np(t.both.price)}`),
    `- ${packages.heritage.name}: from ${np(packages.heritage.fromPrice)}, by application`,
    ...packages.singles.map((s) => `- ${s.name} (${s.hours}): ${np(s.price)}`),
    '',
    '## Areas served',
    ...packages.zones.map((z) => `- ${z.name}: ${z.places} (travel: ${z.travel}; coverage: ${z.coverage})`),
    '',
    '## Pages',
    `- [Services](${url('/services/')})`,
    `- [Packages & prices](${url('/packages/')})`,
    `- [Wedding stories](${url('/weddings/')})`,
    `- [Wedding films](${url('/films/')})`,
    `- [Pre-wedding shoots](${url('/pre-weddings/')})`,
    `- [Commercial work](${url('/commercial/')})`,
    `- [FAQ](${url('/faq/')})`,
    `- [Contact & booking](${url('/contact/')})`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
