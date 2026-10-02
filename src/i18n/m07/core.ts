import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M07_I18N_KEY = {
    QUEST_TITLE: "M07.QUEST.TITLE",
    QUEST_DESCRIPTION: "M07.QUEST.DESCRIPTION",
    OBJECTIVE_REPORT_FINDINGS: "M07.OBJECTIVE.REPORT_FINDINGS",

    MAIL_TIP_SUBJECT: "M07.MAIL.TIP.SUBJECT",
    MAIL_TIP_CONTENT: "M07.MAIL.TIP.CONTENT",
    MAIL_PREMATURE_SUBJECT: "M07.MAIL.PREMATURE.SUBJECT",
    MAIL_PREMATURE_INTRO: "M07.MAIL.PREMATURE.INTRO",
    MAIL_PREMATURE_OUTRO: "M07.MAIL.PREMATURE.OUTRO",
    MAIL_PREMATURE_HINT_TIP: "M07.MAIL.PREMATURE.HINT_TIP",
    MAIL_PREMATURE_HINT_EDGE: "M07.MAIL.PREMATURE.HINT_EDGE",
    MAIL_PREMATURE_HINT_DASHBOARD: "M07.MAIL.PREMATURE.HINT_DASHBOARD",
    MAIL_PREMATURE_HINT_DEADBOX: "M07.MAIL.PREMATURE.HINT_DEADBOX",
    MAIL_PREMATURE_HINT_CREDENTIAL: "M07.MAIL.PREMATURE.HINT_CREDENTIAL",
    MAIL_PREMATURE_HINT_FIREWALL: "M07.MAIL.PREMATURE.HINT_FIREWALL",
    MAIL_PREMATURE_HINT_EXTRACT: "M07.MAIL.PREMATURE.HINT_EXTRACT",
    MAIL_REPORT_SUBJECT: "M07.MAIL.REPORT.SUBJECT",
    MAIL_REPORT_TEMPLATE_CONTENT: "M07.MAIL.REPORT.TEMPLATE_CONTENT",
    MAIL_REPORT_BODY: "M07.MAIL.REPORT.BODY",
    MAIL_HONEYPOT_SUBJECT: "M07.MAIL.HONEYPOT.SUBJECT",
    MAIL_HONEYPOT_CONTENT: "M07.MAIL.HONEYPOT.CONTENT",
    MAIL_TRAP_SUBJECT: "M07.MAIL.TRAP.SUBJECT",
    MAIL_TRAP_CONTENT: "M07.MAIL.TRAP.CONTENT",

    DEVICE_MANIFEST: "M07.DEVICE.MANIFEST",
    DEVICE_MANIFEST_ACCOUNT: "M07.DEVICE.MANIFEST_ACCOUNT",
    DEVICE_MANIFEST_LEGACY_ACCOUNT: "M07.DEVICE.MANIFEST_LEGACY_ACCOUNT",
    DEVICE_ASH_GATE_BACKUP: "M07.DEVICE.ASH_GATE_BACKUP",
    DEVICE_DECOY_README: "M07.DEVICE.DECOY_README",
} as const;

Localization.registerAll({
    en: {
        [M07_I18N_KEY.QUEST_TITLE]: "The Architect",
        [M07_I18N_KEY.QUEST_DESCRIPTION]:
            "Take the proof off the Architect's own box and decide what happens to BLACKLEDGER.",

        [M07_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "Reach the box the payouts answer to, take the master ledger off it without tripping what guards it, and report what it proves to the dead drop.",

        [M07_I18N_KEY.MAIL_TIP_SUBJECT]: "you have the name. now the proof.",
        [M07_I18N_KEY.MAIL_TIP_CONTENT]: [
            "You have a name. A name is not a case.",
            "Everything they own sits in one file, on one box, behind the endpoint every payout session already walks to.",
            "Assume they know the moment you touch it.",
            "",
            "The endpoint is still {{endpoint}}. What answers behind it is not the endpoint.",
        ].join("\n"),

        [M07_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "not yet",
        [M07_I18N_KEY.MAIL_PREMATURE_INTRO]:
            "This is not a case yet. Every line in it has to come from somewhere you've actually been.",
        [M07_I18N_KEY.MAIL_PREMATURE_OUTRO]: "Send it again when it is all yours.",
        [M07_I18N_KEY.MAIL_PREMATURE_HINT_TIP]: "Start with what I already sent you.",
        [M07_I18N_KEY.MAIL_PREMATURE_HINT_EDGE]: "You have not looked at what that box leaves open.",
        [M07_I18N_KEY.MAIL_PREMATURE_HINT_DASHBOARD]: "Not every path on a box is linked from its front page.",
        [M07_I18N_KEY.MAIL_PREMATURE_HINT_DEADBOX]:
            "Two of those machines were written off years ago. One of them was actually forgotten.",
        [M07_I18N_KEY.MAIL_PREMATURE_HINT_CREDENTIAL]: "Whatever was left in that box, read it.",
        [M07_I18N_KEY.MAIL_PREMATURE_HINT_FIREWALL]: "The door in front of it is still locked.",
        [M07_I18N_KEY.MAIL_PREMATURE_HINT_EXTRACT]: "Do not just open that file. Take it whole.",

        [M07_I18N_KEY.MAIL_REPORT_SUBJECT]: "The Architect identified — your call",
        [M07_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "The Architect: {{architect}}",
            "Parent entity: {{parentEntity}}",
            "",
            "Evidence: {{evidence}}",
        ].join("\n"),
        [M07_I18N_KEY.MAIL_REPORT_BODY]: [
            "The Architect: {{architect}}",
            "Parent entity: {{parentEntity}}",
            "",
            "Evidence: {{evidence}}",
        ].join("\n"),

        [M07_I18N_KEY.MAIL_HONEYPOT_SUBJECT]: "SYSTEM ALERT — decoy host touched",
        [M07_I18N_KEY.MAIL_HONEYPOT_CONTENT]: [
            "Someone just poked one of the dead boxes. Real infrastructure doesn't sit that open.",
            "Whoever it is, they're not as careful as they think.",
        ].join("\n"),
        [M07_I18N_KEY.MAIL_TRAP_SUBJECT]: "SYSTEM ALERT — unauthorized access detected",
        [M07_I18N_KEY.MAIL_TRAP_CONTENT]: [
            "A read attempt against a protected backup was logged.",
            "Recommend an alternate extraction method next time.",
        ].join("\n"),

        [M07_I18N_KEY.DEVICE_MANIFEST]: [
            "MASTER LEDGER INDEX",
            "index of settled accounts -- do not mirror, do not export",
            "",
            "{{accounts}}",
            "",
            "[note {{hospitalCaseRef}}]",
            "classification  = employee negligence ({{scapegoat}})",
            "prepared with   = {{riskOfficer}}, {{hospitalName}}",
            "approved        = {{insurer}}, {{approvalDate}}",
            "",
            "[watch]",
            "{{accomplice}}: monitor",
            "",
            "[model]",
            "A loss you can calculate is not a disaster. It is a line in the books.",
            "Price it early, keep the supply managed, and the line stays flat.",
            "",
            "every account, settled.",
        ].join("\n"),
        [M07_I18N_KEY.DEVICE_MANIFEST_ACCOUNT]:
            "{{caseRef}}  {{amount}}  {{settledAt}}  settled",
        [M07_I18N_KEY.DEVICE_MANIFEST_LEGACY_ACCOUNT]:
            "{{name}}  {{year}}  {{region}}  settled",

        [M07_I18N_KEY.DEVICE_ASH_GATE_BACKUP]: [
            "# {{firewallName}} -- configuration backup",
            "# taken 2022, kept for rollback. this box was supposed to go off the rack with it.",
            "",
            "[panel]",
            "host     = {{firewallIp}}",
            "username = {{username}}",
            "password = {{password}}",
            "",
            "[policy]",
            "# everything inbound to the index host stays closed except the site itself",
            "deny 22   -> {{targetLanIp}}",
            "deny 3389 -> {{targetLanIp}}",
            "",
            "# rotate these before the box is decommissioned.",
        ].join("\n"),
        [M07_I18N_KEY.DEVICE_DECOY_README]:
            "cleaned this up months ago, nothing left on this box",
    },
});
