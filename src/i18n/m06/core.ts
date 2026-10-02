import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M06_I18N_KEY = {
    QUEST_TITLE: "M06.QUEST.TITLE",
    QUEST_DESCRIPTION: "M06.QUEST.DESCRIPTION",
    OBJECTIVE_REPORT_FINDINGS: "M06.OBJECTIVE.REPORT_FINDINGS",

    MAIL_TIP_SUBJECT: "M06.MAIL.TIP.SUBJECT",
    MAIL_TIP_CONTENT: "M06.MAIL.TIP.CONTENT",
    MAIL_HOSTS_SUBJECT: "M06.MAIL.HOSTS.SUBJECT",
    MAIL_HOSTS_CONTENT: "M06.MAIL.HOSTS.CONTENT",
    MAIL_PREMATURE_SUBJECT: "M06.MAIL.PREMATURE.SUBJECT",
    MAIL_PREMATURE_INTRO: "M06.MAIL.PREMATURE.INTRO",
    MAIL_PREMATURE_OUTRO: "M06.MAIL.PREMATURE.OUTRO",
    MAIL_PREMATURE_HINT_TIP: "M06.MAIL.PREMATURE.HINT_TIP",
    MAIL_PREMATURE_HINT_REGISTRY: "M06.MAIL.PREMATURE.HINT_REGISTRY",
    MAIL_PREMATURE_HINT_NOMINEES: "M06.MAIL.PREMATURE.HINT_NOMINEES",
    MAIL_PREMATURE_HINT_AGENT: "M06.MAIL.PREMATURE.HINT_AGENT",
    MAIL_PREMATURE_HINT_FILINGS: "M06.MAIL.PREMATURE.HINT_FILINGS",
    MAIL_PREMATURE_HINT_SNAPSHOTS: "M06.MAIL.PREMATURE.HINT_SNAPSHOTS",
    MAIL_PREMATURE_HINT_INSURER: "M06.MAIL.PREMATURE.HINT_INSURER",
    MAIL_PREMATURE_HINT_INFRA: "M06.MAIL.PREMATURE.HINT_INFRA",
    MAIL_PREMATURE_HINT_IDENTITY: "M06.MAIL.PREMATURE.HINT_IDENTITY",
    MAIL_REPORT_SUBJECT: "M06.MAIL.REPORT.SUBJECT",
    MAIL_REPORT_TEMPLATE_CONTENT: "M06.MAIL.REPORT.TEMPLATE_CONTENT",
    MAIL_REPORT_BODY: "M06.MAIL.REPORT.BODY",

    LOG_NOMINEES_1: "M06.LOG.NOMINEES.1",
    LOG_OWNERSHIP_1: "M06.LOG.OWNERSHIP.1",
    LOG_OWNERSHIP_2: "M06.LOG.OWNERSHIP.2",
    LOG_INSURER_1: "M06.LOG.INSURER.1",
    LOG_IDENTITY_1: "M06.LOG.IDENTITY.1",
    LOG_IDENTITY_2: "M06.LOG.IDENTITY.2",
    LOG_CAPTURE_1: "M06.LOG.CAPTURE.1",
    LOG_CERTIFICATE_1: "M06.LOG.CERTIFICATE.1",

    OSINT_WHOIS_AGENT_CONTACT: "M06.OSINT.WHOIS.AGENT_CONTACT",
    OSINT_WHOIS_INSURER_CONTACT: "M06.OSINT.WHOIS.INSURER_CONTACT",
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

        [M06_I18N_KEY.MAIL_HOSTS_SUBJECT]: "who runs the machines",
        [M06_I18N_KEY.MAIL_HOSTS_CONTENT]: [
            "The register tells you who is on paper. It does not tell you who runs the machines.",
            "{{hosttrail}} records which certificate a host presents, and who else presents it. Start with the insurer's customer portal: {{portal}}.",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "not yet",
        [M06_I18N_KEY.MAIL_PREMATURE_INTRO]:
            "That is a filing, not a finding. Every line in it has to come from somewhere you've actually been.",
        [M06_I18N_KEY.MAIL_PREMATURE_OUTRO]: "Send it again when the register backs it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_TIP]: "Ask who signs for Nominees. Start with what I sent you.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_REGISTRY]: "The register is public. You have not opened it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_NOMINEES]:
            "Read the entity's own record before you read anything about it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_AGENT]:
            "A nominee keeps an agent. Find out who answers for the address.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILINGS]:
            "A register keeps what it used to say. Not every page of it is linked.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_SNAPSHOTS]:
            "Two filings, two owners. Read both of them, in full, before you decide which one is a lie.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INSURER]:
            "Follow the name that turns up on both sides of the hospital. One of them used to work for the people who paid.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INFRA]:
            "Show me the address belongs to them. Ask the registrar who holds the domain, not the website what it claims.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_IDENTITY]:
            "You have the company and you have the wire. You do not yet have the man who sat on both.",

        [M06_I18N_KEY.MAIL_REPORT_SUBJECT]: "Open Register — the name behind the nominee",
        [M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "Name: {{architect}}",
            "Position: {{role}}",
            "Ownership chain: {{chain}}",
            "Proof of control: {{proof}}",
            "The front: {{front}}",
        ].join("\n"),
        [M06_I18N_KEY.MAIL_REPORT_BODY]: [
            "Name: {{architect}}",
            "Position: {{role}}",
            "Ownership chain: {{chain}}",
            "Proof of control: {{proof}}",
            "The front: {{front}}",
        ].join("\n"),

        [M06_I18N_KEY.LOG_NOMINEES_1]:
            "Two directors on file. One of them holds four hundred and twelve of these. The register publishes the signature, never the hand.",
        [M06_I18N_KEY.LOG_OWNERSHIP_1]:
            "The owner changed between filings and nobody filed the change. A dissolved trust on one form, a blank on the next.",
        [M06_I18N_KEY.LOG_OWNERSHIP_2]:
            "Two days. That is the whole gap between the trust being wound up and the company that replaced it being incorporated.",
        [M06_I18N_KEY.LOG_INSURER_1]:
            "The officer who authorised the hospital's payout used to run cyber risk for the insurer that approved it. Same people, different letterhead.",
        [M06_I18N_KEY.LOG_IDENTITY_1]:
            "He priced the losses, chaired the committee that decides what gets paid, and sat on the board of the company that owns the account it was paid into.",
        [M06_I18N_KEY.LOG_IDENTITY_2]:
            "None of it is a crime on its own. That is the design. The crime only exists when you put the three filings side by side.",
        [M06_I18N_KEY.LOG_CAPTURE_1]:
            "The archived capture still lists the analyst as the filing contact. The live page does not. Somebody tidied up after us.",
        [M06_I18N_KEY.LOG_CERTIFICATE_1]:
            "The insurer's domain is registered to the same name as the tunnel endpoint the wire transfers walked to. A registrar lists a name on a form. What the machines present is harder to tidy up.",

        [M06_I18N_KEY.OSINT_WHOIS_AGENT_CONTACT]: "Marlowe & Pryce Corporate Services",
        [M06_I18N_KEY.OSINT_WHOIS_INSURER_CONTACT]: "Bulletproof VPN Ltd.",
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

        [M06_I18N_KEY.MAIL_HOSTS_SUBJECT]: "谁在运行那些机器",
        [M06_I18N_KEY.MAIL_HOSTS_CONTENT]: [
            "登记册告诉你纸面上是谁。它不会告诉你是谁在运行那些机器。",
            "{{hosttrail}} 会记录一台主机出示的是哪张证书，以及还有谁出示同一张。先从保险人的客户门户 {{portal}} 查起。",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "还不到时候",
        [M06_I18N_KEY.MAIL_PREMATURE_INTRO]: "那是一份备案，不是一个结论。里面每一行都得来自你真正去过的地方。",
        [M06_I18N_KEY.MAIL_PREMATURE_OUTRO]: "等登记册能替它作证，再发一次。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_TIP]: "先问是谁替 Nominees 签字。从我发给你的东西开始。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_REGISTRY]: "登记册是公开的。你还没打开过它。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_NOMINEES]: "先读这家实体自己的记录，再读关于它的任何说法。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_AGENT]: "名义公司都留着代理人。查清楚是谁替这个地址答话。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILINGS]: "登记册会保留它过去的说法。它并不是每一页都有链接。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_SNAPSHOTS]:
            "两份备案，两个所有人。先把两份都读完，再判断哪一份在说谎。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INSURER]:
            "顺着那个在医院两边都出现的名字查。其中一个人以前就替付钱的那方工作。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INFRA]:
            "拿出证据，说明那个地址属于他们。去问注册商域名在谁名下，别听网站自己怎么写。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_IDENTITY]:
            "公司你有了，汇款也有了。你还缺那个同时坐在两边的人。",

        [M06_I18N_KEY.MAIL_REPORT_SUBJECT]: "公开登记册 — 名义公司背后的名字",
        [M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "姓名：{{architect}}",
            "职务：{{role}}",
            "持股链条：{{chain}}",
            "控制证据：{{proof}}",
            "挡在前面的人：{{front}}",
        ].join("\n"),
        [M06_I18N_KEY.MAIL_REPORT_BODY]: [
            "姓名：{{architect}}",
            "职务：{{role}}",
            "持股链条：{{chain}}",
            "控制证据：{{proof}}",
            "挡在前面的人：{{front}}",
        ].join("\n"),

        [M06_I18N_KEY.LOG_NOMINEES_1]:
            "备案上有两位董事。其中一个人手里有四百一十二家这样的公司。登记册公布的是签名，从来不是那只手。",
        [M06_I18N_KEY.LOG_OWNERSHIP_1]:
            "两份备案之间所有人换了，却没有人去备案这件事。前一张写着一个已解散的信托，后一张是空白。",
        [M06_I18N_KEY.LOG_OWNERSHIP_2]:
            "两天。信托被清算，到接手它的那家公司成立，中间就差这两天。",
        [M06_I18N_KEY.LOG_INSURER_1]:
            "批准医院付款的那位高管，以前替批准理赔的那家保险人管网络风险。同一批人，换了信头。",
        [M06_I18N_KEY.LOG_IDENTITY_1]:
            "损失是他定价的，决定赔不赔的委员会是他主持的，而收款账户所属公司的董事会上也有他。",
        [M06_I18N_KEY.LOG_IDENTITY_2]:
            "单看每一件都不构成犯罪。这正是设计的用意。只有把三份备案并排放在一起，罪才成立。",
        [M06_I18N_KEY.LOG_CAPTURE_1]:
            "存档快照里，那位分析师还挂着备案联系人。实时页面上已经没有了。有人在我们后面收拾过。",
        [M06_I18N_KEY.LOG_CERTIFICATE_1]:
            "保险人的域名登记在与汇款隧道端点相同的名字之下。注册商记录的只是表格上的名字，机器自己出示的东西就没那么容易收拾干净。",

        [M06_I18N_KEY.OSINT_WHOIS_AGENT_CONTACT]: "Marlowe & Pryce Corporate Services",
        [M06_I18N_KEY.OSINT_WHOIS_INSURER_CONTACT]: "防弹 VPN 有限公司",
    },
});
