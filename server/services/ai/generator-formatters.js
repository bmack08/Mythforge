// JSON → Homebrewery markdown formatters for TaleForge's structured generators.
//
// TaleForge's generators return structured JSON (see app/schemas/generators.py).
// To drop them into a brew as styled content, each generator type gets a
// formatter that emits ready-to-render Homebrewery markdown (the same
// constructs markdownToTiptap understands: {{descriptive}}, {{note}}, pipe
// tables, {{monster,frame}}, headings). This is the Phase-2 "format the AI
// output" lesson applied to structured generator output.
//
// Add formatters here as generators are surfaced (npc, item, encounter, …).

function s(v) {
  return (v === null || v === undefined) ? '' : String(v).trim();
}

// Escape a value for use inside a markdown table cell.
function cell(v) {
  return s(v).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
}

function list(v) {
  return Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
}

// ── Shop ────────────────────────────────────────────────────────────────
export function formatShop(shop = {}) {
  const out = [];
  out.push(`## ${s(shop.shop_name) || 'Unnamed Shop'}`);

  const meta = [
    s(shop.type),
    s(shop.location),
    s(shop.price_range) && `${s(shop.price_range)} prices`,
    s(shop.quality_of_goods) && `${s(shop.quality_of_goods)} goods`
  ].filter(Boolean).join(' · ');
  if (meta) out.push(`*${meta}*`);

  const owners = list(shop.owners);
  if (owners.length) {
    out.push('');
    out.push('{{note');
    out.push(`##### Proprietor${owners.length > 1 ? 's' : ''}`);
    out.push(owners.join(', '));
    out.push('}}');
  }

  const items = list(shop.items);
  if (items.length) {
    out.push('');
    out.push('| Item | Type | Price | Rarity |');
    out.push('|:-----|:-----|:------|:-------|');
    for (const it of items) {
      out.push(`| ${cell(it.name)} | ${cell(it.type) || '—'} | ${cell(it.price) || '—'} | ${cell(it.rarity) || 'Common'} |`);
    }
    // Any item with notable effects/description → a descriptive callout.
    const notable = items.filter(it => s(it.special_effects) || s(it.description) || s(it.usage));
    for (const it of notable) {
      const detail = s(it.special_effects) || s(it.description);
      if (!detail) continue;
      out.push('');
      out.push('{{descriptive');
      out.push(`**${s(it.name)}.** ${detail}${s(it.usage) ? ` *${s(it.usage)}*` : ''}`);
      out.push('}}');
    }
  }

  const services = list(shop.services);
  if (services.length) {
    out.push('');
    out.push('### Services');
    for (const sv of services) {
      const price = s(sv.price_info) ? ` (${s(sv.price_info)})` : '';
      out.push(`- **${s(sv.name)}**${price} — ${s(sv.description)}`);
    }
  }

  if (s(shop.custom_note)) {
    out.push('');
    out.push('{{note');
    out.push(s(shop.custom_note));
    out.push('}}');
  }

  return out.join('\n');
}

// ── Generic fallback ──────────────────────────────────────────────────────
// Readable (not a raw JSON dump) for generator types not yet given a bespoke
// formatter — rendered as a heading + key/value bullets so it still reads as
// content in the brew. Bespoke formatters are added in the EXTEND step.
export function formatGeneric(type, data = {}) {
  const out = [`## ${s(data.name || data.title || data.shop_name || data.item_name || data.quest_name || type)}`];
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined || v === '') continue;
    const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (Array.isArray(v)) {
      if (!v.length) continue;
      out.push(`\n**${label}:**`);
      for (const item of v) {
        out.push(`- ${typeof item === 'object' ? s(item.name || item.title || JSON.stringify(item)) : s(item)}`);
      }
    } else if (typeof v === 'object') {
      out.push(`\n**${label}:** ${s(JSON.stringify(v))}`);
    } else {
      out.push(`\n**${label}:** ${s(v)}`);
    }
  }
  return out.join('\n');
}

const FORMATTERS = {
  shop: formatShop
};

export function format(type, data) {
  const fn = FORMATTERS[type];
  return fn ? fn(data) : formatGeneric(type, data);
}
