import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { BLACKLEDGER_DOMAIN } from "../../../content/global/blackledger.js";
import {
    M07_LEDGER_ACCOUNTS,
    M07_LEDGER_AUDIT_NOTE,
    M07_LEDGER_ORGANISATION,
    M07_LEDGER_OWNERSHIP_CHAIN,
    M07_LEDGER_PAYMENT_ROWS,
    M07_LEDGER_PAYMENT_TOTAL,
    M07_LEDGER_POSTINGS,
    M07_LEDGER_PROOF,
    M07_LEDGER_PROTOTYPE_CHAT,
    M07_LEDGER_Q3_COUNT,
    M07_LEDGER_RECEIPT_CAPTION,
    M07_LEDGER_RELEASE_ORDERS,
    M07_LEDGER_ROOM_ASSET,
    M07_LEDGER_ROOM_FOOTER,
    M07_LEDGER_ROOM_PATH,
    M07_LEDGER_ROOM_TAGLINE,
    M07_LEDGER_ROOM_UPDATED,
    M07_LEDGER_ROOM_VIEWER,
    M07_LEDGER_SUPPORT,
    M07_LEDGER_SUPPORT_FACTS,
    M07_LEDGER_SUPPORT_GAP,
    M07_PROTOTYPE_DATE,
    type LedgerNode,
    type LedgerPaymentRow,
    type LedgerTier,
} from "../../../content/m07/blackledger.js";
import { M01_CASE_ID, M01_LEDGERVAULT_PROJECT_LABEL } from "../../../content/global/case.js";
import { isM07LedgerRoomOpen } from "../../../context/m07/progress.js";
import { escapeHtml, fillMarkers } from "../../global/localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";
import { toolIcon } from "../../global/tool-page.js";

import frameHtml from "./frame.html";
import roomStyle from "./style.html";

const ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#050506"/>' +
        '<path d="M32 9 54 53H41L32 36 23 53H10Z" fill="none" stroke="#ff2a2a" stroke-width="5" stroke-linejoin="round"/>',
);

const NAV: readonly { readonly path: string; readonly label: string }[] = [
    { path: M07_LEDGER_ROOM_PATH.home, label: "Accounts" },
    { path: M07_LEDGER_ROOM_PATH.organisation, label: "Organisation" },
    { path: M07_LEDGER_ROOM_PATH.notice, label: "Notice" },
    { path: M07_LEDGER_ROOM_PATH.payments, label: "Payments" },
    { path: M07_LEDGER_ROOM_PATH.proof, label: "Proof" },
    { path: M07_LEDGER_ROOM_PATH.support, label: "Support" },
];

const esc = escapeHtml;

const renderNav = (current: string): string =>
    NAV.map(
        (entry) =>
            `<a href="${esc(entry.path)}"${entry.path === current ? ' class="on"' : ""}>${esc(entry.label)}</a>`,
    ).join("");

const page = (current: string, title: string, lead: string, body: string): string =>
    fillMarkers(frameHtml, {
        RL_STYLE: roomStyle,
        RL_NAV: renderNav(current),
        RL_VIEWER: esc(M07_LEDGER_ROOM_VIEWER),
        RL_TAGLINE: esc(M07_LEDGER_ROOM_TAGLINE),
        RL_FOOTER: esc(M07_LEDGER_ROOM_FOOTER),
        RL_UPDATED: esc(`Ledger room posted ${M07_LEDGER_ROOM_UPDATED}`),
        RL_TITLE: esc(title),
        RL_LEAD: lead === "" ? "" : `<p class="lead">${esc(lead)}</p>`,
        RL_BODY: body,
    });

const accountsPage = (): string => {
    const rows = M07_LEDGER_ACCOUNTS.map(
        (entry) =>
            `<tr><td>${esc(entry.account)}</td><td class="mono">${esc(entry.project)}</td><td>${esc(entry.region)}</td>` +
            `<td class="mono">${esc(entry.opened)}</td><td class="mono">${esc(entry.batch)}</td>` +
            `<td class="num">${esc(entry.gross)}</td>` +
            `<td><span class="tag ${entry.status === "SETTLED" ? "settled" : "reserved"}">${entry.status}</span></td></tr>`,
    ).join("");

    return page(
        M07_LEDGER_ROOM_PATH.home,
        "Accounts",
        `Every account has a project code. Q3 2026 carries ${M07_LEDGER_Q3_COUNT}: two settled, two still reserved.`,
        `<table><thead><tr><th>Account</th><th>Project</th><th>Region</th><th>Opened</th><th>Batch</th><th class="num">Gross</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>` +
            `<p class="note">${esc(`${M01_LEDGERVAULT_PROJECT_LABEL} is ${M01_CASE_ID}. The reserves were opened before the events they stand against.`)}</p>`,
    );
};

const renderNode = (node: LedgerNode): string =>
    `<div class="node${node.tone === undefined ? "" : ` ${node.tone}`}">` +
    `<b>${esc(node.name)}</b>${node.share === undefined ? "" : `<em>${esc(node.share)}</em>`}` +
    `<span>${esc(node.role)}</span></div>`;

const renderTier = (tier: LedgerTier): string =>
    `<div><div class="tier-cap">${esc(tier.caption)}</div><div class="nodes">${tier.nodes.map(renderNode).join("")}</div></div>`;

const organisationPage = (): string =>
    page(
        M07_LEDGER_ROOM_PATH.organisation,
        "Organisation",
        "Who decides, who is paid, and who is sent to look at the doors.",
        `<div class="tiers">${M07_LEDGER_ORGANISATION.map(renderTier).join("")}</div>` +
            `<p class="chain"><b>Ownership of record.</b> ${esc(M07_LEDGER_OWNERSHIP_CHAIN)}</p>`,
    );

const figure = (src: string, alt: string, caption: string): string =>
    `<figure><img src="${esc(src)}" alt="${esc(alt)}"><figcaption>${caption}</figcaption></figure>`;

const noticePage = (): string => {
    const chat = M07_LEDGER_PROTOTYPE_CHAT.map(
        (line) =>
            `<div class="ln"><span class="tm">${esc(line.time)}</span><span class="who ${line.who}">${esc(line.who)}</span><span>${esc(line.line)}</span></div>`,
    ).join("");

    return page(
        M07_LEDGER_ROOM_PATH.notice,
        "Notice",
        "The locker was ordered as a template. It reads like an accounting notice because the Chair asked for exactly that.",
        figure(
            M07_LEDGER_ROOM_ASSET.prototype,
            "Prototype build on the developer's desktop",
            `<b>Prototype, ${esc(M07_PROTOTYPE_DATE)}.</b> The first build on the developer's own machine, with the project code left as a variable and the spec open beside it.`,
        ) +
            `<h2>Order</h2><div class="chat">${chat}</div>` +
            `<h2>Delivered</h2><div class="pair">` +
            figure(
                M07_LEDGER_ROOM_ASSET.delivered,
                "Lock screen as delivered",
                `<b>Lock screen, ${esc(M01_LEDGERVAULT_PROJECT_LABEL)}.</b> The same template with the variables filled for ${esc(M01_CASE_ID)}.`,
            ) +
            figure(
                M07_LEDGER_ROOM_ASSET.notice,
                "Settlement notice",
                "<b>Settlement notice.</b> The account is opened, the terms are four lines long, and the clock is twelve hours.",
            ) +
            "</div>",
    );
};

const paymentCells = (row: LedgerPaymentRow, className: string): string =>
    `<tr${className === "" ? "" : ` class="${className}"`}><td>${esc(row.account)}</td><td class="mono">${esc(row.batch)}</td>` +
    `<td class="mono">${esc(row.settledAt)}</td><td class="num">${esc(row.gross)}</td><td class="num">${esc(row.parent)}</td>` +
    `<td class="num">${esc(row.panel)}</td><td class="num">${esc(row.broker)}</td><td class="num">${esc(row.retained)}</td></tr>`;

const paymentsPage = (): string => {
    const rows = [...M07_LEDGER_PAYMENT_ROWS.map((row) => paymentCells(row, "")), paymentCells(M07_LEDGER_PAYMENT_TOTAL, "total")].join("");
    const postings = M07_LEDGER_POSTINGS.map(
        (entry) => `<tr><td class="mono">${esc(entry.time)}</td><td>${esc(entry.line)}</td></tr>`,
    ).join("");

    return page(
        M07_LEDGER_ROOM_PATH.payments,
        "Payments",
        "Every batch is split the same way before the hour is out.",
        `<table><thead><tr><th>Account</th><th>Batch</th><th>Settled</th><th class="num">Gross</th><th class="num">SKN</th><th class="num">Panel</th><th class="num">Broker</th><th class="num">Kept</th></tr></thead><tbody>${rows}</tbody></table>` +
            `<h2>Posting, ${esc(M01_CASE_ID)}</h2><table><thead><tr><th>UTC</th><th>Entry</th></tr></thead><tbody>${postings}</tbody></table>` +
            `<p class="note">${esc(M07_LEDGER_AUDIT_NOTE)}</p>` +
            `<h2>Release orders</h2><div class="proof"><div><p>${esc(M07_LEDGER_RELEASE_ORDERS.join("   |   "))}</p></div></div>`,
    );
};

const proofPage = (): string => {
    const items = M07_LEDGER_PROOF.map(
        (item) => `<div><b>${esc(item.title)}</b><p>${esc(item.body)}</p></div>`,
    ).join("");

    return page(
        M07_LEDGER_ROOM_PATH.proof,
        "Proof",
        "What each account needed before it could be opened.",
        figure(M07_LEDGER_ROOM_ASSET.receipt, "Escrow receipt for the access purchase", esc(M07_LEDGER_RECEIPT_CAPTION)) +
            `<div class="proof">${items}</div>`,
    );
};

const supportPage = (): string => {
    const lines = M07_LEDGER_SUPPORT.map((entry, index) => {
        const gap =
            index === 4 ? `<div class="gap">-- ${esc(M07_LEDGER_SUPPORT_GAP)} --</div>` : "";
        return `${gap}<div class="ln"><span class="tm">${esc(entry.time)}</span><span class="who ${entry.who}">${esc(entry.who)}</span><span>${esc(entry.line)}</span></div>`;
    }).join("");
    const facts = M07_LEDGER_SUPPORT_FACTS.map(
        (fact) => `<div><span>${esc(fact.label)}</span><span>${esc(fact.value)}</span></div>`,
    ).join("");

    return page(
        M07_LEDGER_ROOM_PATH.support,
        "Support",
        `Channel log, ${M01_CASE_ID}. One negotiator per account.`,
        `<div class="cols"><div class="chat">${lines}</div><div class="facts">${facts}</div></div>`,
    );
};

const room = (
    path: string,
    title: string,
    description: string,
    render: () => string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        if (!isM07LedgerRoomOpen()) return notFoundMetadata();

        return requireHttps(context) ?? { title, description, html: render() };
    },
});

@RegisterWebsite
export class BlackledgerRoomWebsite extends Website {
    SiteName = "BLACKLEDGER";
    Host = BLACKLEDGER_DOMAIN;
    Icon = ICON;

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m07", [
        room(M07_LEDGER_ROOM_PATH.home, "BLACKLEDGER", M07_LEDGER_ROOM_TAGLINE, accountsPage),
        room(M07_LEDGER_ROOM_PATH.organisation, "BLACKLEDGER — Organisation", "Who decides and who is paid.", organisationPage),
        room(M07_LEDGER_ROOM_PATH.notice, "BLACKLEDGER — Notice", "The locker and its notice.", noticePage),
        room(M07_LEDGER_ROOM_PATH.payments, "BLACKLEDGER — Payments", "Batches and postings.", paymentsPage),
        room(M07_LEDGER_ROOM_PATH.proof, "BLACKLEDGER — Proof", "What each account needed.", proofPage),
        room(M07_LEDGER_ROOM_PATH.support, "BLACKLEDGER — Support", "The escrow channel.", supportPage),
    ]);
}
