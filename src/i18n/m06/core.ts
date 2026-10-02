import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M06_I18N_KEY = {
    QUEST_TITLE: "M06.QUEST.TITLE",
    QUEST_DESCRIPTION: "M06.QUEST.DESCRIPTION",
    OBJECTIVE_REPORT_FINDINGS: "M06.OBJECTIVE.REPORT_FINDINGS",

    MAIL_TIP_SUBJECT: "M06.MAIL.TIP.SUBJECT",
    MAIL_TIP_CONTENT: "M06.MAIL.TIP.CONTENT",
    MAIL_PREMATURE_SUBJECT: "M06.MAIL.PREMATURE.SUBJECT",
    MAIL_PREMATURE_INTRO: "M06.MAIL.PREMATURE.INTRO",
    MAIL_PREMATURE_OUTRO: "M06.MAIL.PREMATURE.OUTRO",
    MAIL_PREMATURE_HINT_TIP: "M06.MAIL.PREMATURE.HINT_TIP",
    MAIL_PREMATURE_HINT_REGISTRY: "M06.MAIL.PREMATURE.HINT_REGISTRY",
    MAIL_PREMATURE_HINT_NOMINEES: "M06.MAIL.PREMATURE.HINT_NOMINEES",
    MAIL_PREMATURE_HINT_AGENT: "M06.MAIL.PREMATURE.HINT_AGENT",
    MAIL_PREMATURE_HINT_FILINGS: "M06.MAIL.PREMATURE.HINT_FILINGS",
    MAIL_REPORT_SUBJECT: "M06.MAIL.REPORT.SUBJECT",
    MAIL_REPORT_TEMPLATE_CONTENT: "M06.MAIL.REPORT.TEMPLATE_CONTENT",
    MAIL_REPORT_BODY: "M06.MAIL.REPORT.BODY",

    OSINT_WHOIS_AGENT_CONTACT: "M06.OSINT.WHOIS.AGENT_CONTACT",
} as const;

Localization.registerAll({
    en: {
        [M06_I18N_KEY.QUEST_TITLE]: "Open Register",
        [M06_I18N_KEY.QUEST_DESCRIPTION]:
            "Follow the nominee company back through its filings to the person who actually signs for it.",
        [M06_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "Work the public register until the owner behind SKN Capital Nominees stops being a name on a form, and report what it proves to the dead drop.",

        [M06_I18N_KEY.MAIL_TIP_SUBJECT]: "nominees: who signs for it",
        [M06_I18N_KEY.MAIL_TIP_CONTENT]: [
            "A nominee company is not a company. It is a mailing address with a signature on file.",
            "Somebody filed it, somebody keeps filing it, and the register in {{jurisdiction}} keeps every version it was ever given.",
            "",
            "Start with the register: {{registry}}. Read what it says about {{entity}}, then read what it used to say.",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "not yet",
        [M06_I18N_KEY.MAIL_PREMATURE_INTRO]:
            "That is a filing, not a finding. Every line in it has to come from somewhere you've actually been.",
        [M06_I18N_KEY.MAIL_PREMATURE_OUTRO]: "Send it again when the register backs it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_TIP]: "Ask who signs for Nominees. Start with what I sent you.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_REGISTRY]: "The register is public. You have not opened it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_NOMINEES]: "Read the entity's own record before you read anything about it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_AGENT]: "A nominee keeps an agent. Find out who answers for the address.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILINGS]:
            "A register keeps what it used to say. Not every page of it is linked.",

        [M06_I18N_KEY.MAIL_REPORT_SUBJECT]: "Open Register — the nominee and its agent",
        [M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "Nominee company: {{nominees}}",
            "Registered agent: {{agent}}",
        ].join("\n"),
        [M06_I18N_KEY.MAIL_REPORT_BODY]: [
            "Nominee company: {{nominees}}",
            "Registered agent: {{agent}}",
        ].join("\n"),

        [M06_I18N_KEY.OSINT_WHOIS_AGENT_CONTACT]: "Marlowe & Pryce Corporate Services",
    },
    zh: {
        [M06_I18N_KEY.QUEST_TITLE]: "公开登记册",
        [M06_I18N_KEY.QUEST_DESCRIPTION]: "顺着这家名义公司的历年备案，查出真正替它签字的人。",
        [M06_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "把公开登记册翻到底，让 SKN Capital Nominees 背后的所有者不再只是表格上的一个名字，然后把结论报给死信箱。",

        [M06_I18N_KEY.MAIL_TIP_SUBJECT]: "名义公司：是谁在签字",
        [M06_I18N_KEY.MAIL_TIP_CONTENT]: [
            "名义公司不是公司。它是一个通信地址，加上一份存档的签名。",
            "有人替它备案，而且一直在备案，而 {{jurisdiction}} 的登记册会保留它收到过的每一个版本。",
            "",
            "从登记册开始：{{registry}}。先看它现在怎么写 {{entity}}，再看它过去怎么写。",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "还不到时候",
        [M06_I18N_KEY.MAIL_PREMATURE_INTRO]: "那是一份备案，不是一个结论。里面每一行都得来自你真正去过的地方。",
        [M06_I18N_KEY.MAIL_PREMATURE_OUTRO]: "等登记册能替它作证，再发一次。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_TIP]: "先问是谁替 Nominees 签字。从我发给你的东西开始。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_REGISTRY]: "登记册是公开的。你还没打开过它。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_NOMINEES]: "先读这家实体自己的记录，再读关于它的任何说法。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_AGENT]: "名义公司都留着代理人。查清楚是谁替这个地址答话。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILINGS]: "登记册会保留它过去的说法。它并不是每一页都有链接。",

        [M06_I18N_KEY.MAIL_REPORT_SUBJECT]: "公开登记册 — 名义公司与其代理人",
        [M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: ["名义公司：{{nominees}}", "注册代理人：{{agent}}"].join("\n"),
        [M06_I18N_KEY.MAIL_REPORT_BODY]: ["名义公司：{{nominees}}", "注册代理人：{{agent}}"].join("\n"),

        [M06_I18N_KEY.OSINT_WHOIS_AGENT_CONTACT]: "Marlowe & Pryce Corporate Services",
    },
});
