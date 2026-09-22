import { M01_LISTING_KEY } from "./m01-listing-template-i18n.js";
import { M01_CATEGORY_DESCRIPTION_KEYS, type M01ListingResolvedSlot, type M01ListingSlot } from "./m01-listing-pool.js";
import { siteT } from "./m01-site-strings-cache.js";
import { M01_SITE_KEY } from "./m01-site-shared-i18n.js";

interface M01ListingRenderContext {
    readonly slot: M01ListingSlot;
    readonly resolved: M01ListingResolvedSlot;
    readonly isWinner: boolean;
}

const winnerNotes = (): { readonly description: string; readonly notes: string[]; readonly accessType: string; readonly hint: string } => ({
    description: siteT(M01_LISTING_KEY.WINNER_DESCRIPTION),
    notes: [
        siteT(M01_LISTING_KEY.WINNER_NOTE1),
        siteT(M01_LISTING_KEY.WINNER_NOTE2),
    ],
    accessType: siteT(M01_LISTING_KEY.WINNER_ACCESS_TYPE),
    hint: siteT(M01_LISTING_KEY.WINNER_HINT),
});

const decoyNotes = (category: string, region: string): { readonly description: string; readonly notes: string[]; readonly accessType: string } => {
    const categoryLabel = category.replace(/_/g, " ");
    const descriptionKey = M01_CATEGORY_DESCRIPTION_KEYS[category];

    return {
        description: descriptionKey ? siteT(descriptionKey) : siteT(M01_LISTING_KEY.DECOY_DEFAULT_DESCRIPTION),
        notes: [
            siteT(M01_LISTING_KEY.DECOY_NOTE_SECTOR_REGION, { category: categoryLabel, region }),
            siteT(M01_LISTING_KEY.DECOY_NOTE_CONFIRMED),
        ],
        accessType: siteT(M01_LISTING_KEY.DECOY_ACCESS_TYPE, { category: categoryLabel }),
    };
};

const siteTheme = {
    blackwire: { accent: "#7fffd4", bg: "#0b0b0f", panel: "#101015", border: "#33333b", field: "#0d0d12", muted: "#666", text: "#d8d8d8", brand: "BLACKWIRE NETWORK", h1: "#ff8844" },
    frostgate: { accent: "#7fd0ff", bg: "#070a0c", panel: "#080f12", border: "#1c2c33", field: "#0c161a", muted: "#597781", text: "#c9d6d8", brand: "FROSTGATE EXCHANGE", h1: "#7fd0ff" },
    obsidian: { accent: "#c48aff", bg: "#0a0810", panel: "#0d0a13", border: "#241d2e", field: "#120d1a", muted: "#5f5470", text: "#d3c9de", brand: "OBSIDIAN ACCESS", h1: "#c48aff" },
} as const;

export const renderM01ListingPage = (ctx: M01ListingRenderContext): string => {
    const theme = siteTheme[ctx.slot.site];
    const code = `${ctx.resolved.category}-${ctx.resolved.region}-${ctx.resolved.code}`;
    const title = ctx.isWinner
        ? siteT(M01_LISTING_KEY.WINNER_TITLE, { code, region: ctx.resolved.region })
        : siteT(M01_LISTING_KEY.DECOY_TITLE, {
            code,
            category: ctx.resolved.category.replace(/_/g, " "),
            region: ctx.resolved.region,
        });
    const info = ctx.isWinner ? winnerNotes() : decoyNotes(ctx.resolved.category, ctx.resolved.region);
    const hint = "hint" in info ? `<p class="hint">${info.hint}</p>` : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${theme.brand} — ${code}</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:32px;background:${theme.bg};color:${theme.text};font-family:Consolas,"Courier New",monospace;line-height:1.6}
.container{max-width:980px;margin:auto}
header{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;margin-bottom:28px;border-bottom:1px solid ${theme.border}}
.brand{color:${theme.accent};font-size:20px;font-weight:bold;letter-spacing:1px}
.node{color:${theme.muted};font-size:12px;text-align:right}.status{color:${theme.accent}}.sold{color:${theme.muted}}
.title-row{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:6px}
h1{margin:0;color:${theme.h1};font-size:28px;font-weight:normal}
.back-button{flex-shrink:0;display:inline-block;padding:10px 16px;border:1px solid ${theme.border};background:${theme.panel};color:${theme.accent};text-decoration:none;font-size:12px;letter-spacing:.4px}
.subtitle{color:${theme.muted};font-size:12px;margin-bottom:26px}
.panel{border:1px solid ${theme.border};background:${theme.panel};padding:20px;margin-bottom:18px}
.panel-title{color:${theme.accent};font-size:13px;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.field{border:1px solid ${theme.border};padding:12px;background:${theme.field}}
.label{color:${theme.muted};font-size:10px;text-transform:uppercase;margin-bottom:4px}
.value{color:${theme.text};font-size:13px}
.description{color:${theme.muted};max-width:850px}
.notes{margin:0;padding-left:20px;color:${theme.muted}}.notes li{margin-bottom:8px}
.hint{margin-top:14px;color:${theme.muted};font-size:12px}
.price{margin-top:18px;padding:14px;border-left:3px solid ${theme.accent};background:${theme.field}}
.price-label{color:${theme.muted};font-size:10px;text-transform:uppercase}.price-value{color:${theme.accent};font-size:22px}
.log{border-top:1px solid ${theme.border}}.log-item{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:11px 0;border-bottom:1px solid ${theme.border};font-size:12px}
.time{color:${theme.muted}}.event{color:${theme.muted}}
footer{display:flex;justify-content:space-between;gap:20px;margin-top:28px;padding-top:18px;border-top:1px solid ${theme.border};color:${theme.muted};font-size:11px}
@media(max-width:700px){body{padding:18px}.grid{grid-template-columns:1fr}.log-item{grid-template-columns:1fr;gap:3px}.title-row{align-items:flex-start;flex-direction:column}.back-button{width:100%;text-align:center}footer{flex-direction:column}h1{font-size:22px}}
</style>
</head>
<body${ctx.isWinner ? ' data-m1-canonical-listing="true"' : ""}>
<div class="container">
<header>
<div class="brand">${theme.brand}</div>
<div class="node">NODE ${ctx.slot.nodeLabel}<br><span class="status">${siteT(M01_SITE_KEY.STATUS_ONLINE_DOT)}</span></div>
</header>

<div class="title-row">
<h1>${title}</h1>
<a class="back-button" href="/">${siteT(M01_SITE_KEY.BACK_TO_LISTINGS)}</a>
</div>
<div class="subtitle">LISTING #${code} · LAST UPDATED 21:03 UTC</div>

<section class="panel">
<div class="panel-title">${siteT(M01_SITE_KEY.PANEL_LISTING_INFO)}</div>
<div class="grid">
<div class="field"><div class="label">${siteT(M01_SITE_KEY.LABEL_VENDOR)}</div><div class="value">${ctx.resolved.vendor}</div></div>
<div class="field"><div class="label">${siteT(M01_SITE_KEY.LABEL_STATUS)}</div><div class="value sold">${siteT(M01_SITE_KEY.STATUS_SOLD_DOT)}</div></div>
<div class="field"><div class="label">${siteT(M01_SITE_KEY.LABEL_REGION)}</div><div class="value">${ctx.resolved.region}</div></div>
<div class="field"><div class="label">${siteT(M01_SITE_KEY.LABEL_LISTED)}</div><div class="value">${siteT(M01_SITE_KEY.DAYS_AGO, { n: 70 })}</div></div>
<div class="field"><div class="label">${siteT(M01_SITE_KEY.LABEL_ACCESS_TYPE)}</div><div class="value">${info.accessType}</div></div>
<div class="field"><div class="label">${siteT(M01_SITE_KEY.LABEL_REPUTATION)}</div><div class="value">80 / 100</div></div>
</div>
</section>

<section class="panel">
<div class="panel-title">${siteT(M01_SITE_KEY.PANEL_LISTING_NOTES)}</div>
<p class="description">${info.description}</p>
<ul class="notes">
${info.notes.map((note) => `<li>${note}</li>`).join("\n")}
</ul>
<div class="price"><div class="price-label">${siteT(M01_SITE_KEY.FINAL_PRICE)}</div><div class="price-value">${siteT(M01_SITE_KEY.PRICE_UNDISCLOSED)}</div></div>
${hint}
</section>

<section class="panel">
<div class="panel-title">${siteT(M01_SITE_KEY.PANEL_ACTIVITY_LOG)}</div>
<div class="log">
<div class="log-item"><div class="time">${siteT(M01_SITE_KEY.DAYS_AGO, { n: 70 })}</div><div class="event">${siteT(M01_SITE_KEY.SOLD_LOG_CREATED)}</div></div>
<div class="log-item"><div class="time">${siteT(M01_SITE_KEY.DAYS_AGO, { n: 67 })}</div><div class="event">${siteT(M01_SITE_KEY.SOLD_LOG_BUYER_CONFIRMED)}</div></div>
<div class="log-item"><div class="time">${siteT(M01_SITE_KEY.DAYS_AGO, { n: 67 })}</div><div class="event">${siteT(M01_SITE_KEY.SOLD_LOG_ESCROW_RELEASED)}</div></div>
</div>
</section>

<footer>
<span>${siteT(M01_SITE_KEY.FOOTER_TAGLINE_TEMPLATE, { brand: theme.brand })}</span>
<span>${siteT(M01_SITE_KEY.FOOTER_COPYRIGHT_TEMPLATE, { brand: theme.brand })}</span>
</footer>
</div>
</body>
</html>
`;
};
