import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M06_I18N_KEY = {
    QUEST_TITLE: "M06.QUEST.TITLE",
    QUEST_DESCRIPTION: "M06.QUEST.DESCRIPTION",
    OBJECTIVE_REPORT_FINDINGS: "M06.OBJECTIVE.REPORT_FINDINGS",

    MAIL_TIP_SUBJECT: "M06.MAIL.TIP.SUBJECT",
    MAIL_TIP_CONTENT: "M06.MAIL.TIP.CONTENT",
    MAIL_HOSTS_SUBJECT: "M06.MAIL.HOSTS.SUBJECT",
    MAIL_HOSTS_CONTENT: "M06.MAIL.HOSTS.CONTENT",
    MAIL_AGENT_SUBJECT: "M06.MAIL.AGENT.SUBJECT",
    MAIL_AGENT_CONTENT: "M06.MAIL.AGENT.CONTENT",
    MAIL_PREMATURE_SUBJECT: "M06.MAIL.PREMATURE.SUBJECT",
    MAIL_PREMATURE_INTRO: "M06.MAIL.PREMATURE.INTRO",
    MAIL_PREMATURE_OUTRO: "M06.MAIL.PREMATURE.OUTRO",
    MAIL_PREMATURE_HINT_TIP: "M06.MAIL.PREMATURE.HINT_TIP",
    MAIL_PREMATURE_HINT_DOOR_SEEN: "M06.MAIL.PREMATURE.HINT_DOOR_SEEN",
    MAIL_PREMATURE_HINT_REGISTRY: "M06.MAIL.PREMATURE.HINT_REGISTRY",
    MAIL_PREMATURE_HINT_NOMINEES: "M06.MAIL.PREMATURE.HINT_NOMINEES",
    MAIL_PREMATURE_HINT_AGENT: "M06.MAIL.PREMATURE.HINT_AGENT",
    MAIL_PREMATURE_HINT_FILINGS: "M06.MAIL.PREMATURE.HINT_FILINGS",
    MAIL_PREMATURE_HINT_FILING_2019: "M06.MAIL.PREMATURE.HINT_FILING_2019",
    MAIL_PREMATURE_HINT_FILING_2024: "M06.MAIL.PREMATURE.HINT_FILING_2024",
    MAIL_PREMATURE_HINT_HOLDINGS: "M06.MAIL.PREMATURE.HINT_HOLDINGS",
    MAIL_PREMATURE_HINT_INSURER: "M06.MAIL.PREMATURE.HINT_INSURER",
    MAIL_PREMATURE_HINT_INFRA: "M06.MAIL.PREMATURE.HINT_INFRA",
    MAIL_PREMATURE_HINT_DOOR_OPEN: "M06.MAIL.PREMATURE.HINT_DOOR_OPEN",
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
    LOG_AGENT_1: "M06.LOG.AGENT.1",
    LOG_AGENT_2: "M06.LOG.AGENT.2",

    OSINT_WHOIS_AGENT_CONTACT: "M06.OSINT.WHOIS.AGENT_CONTACT",
    OSINT_WHOIS_INSURER_CONTACT: "M06.OSINT.WHOIS.INSURER_CONTACT",
} as const;

Localization.registerAll({
    en: {
        [M06_I18N_KEY.QUEST_TITLE]: "Open Register",
        [M06_I18N_KEY.QUEST_DESCRIPTION]:
            "A door that isn't on any map asks for a sentence only the insurer's committee can read. Follow the nominee company through the register to find what opens it.",
        [M06_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "Work the public register until you can open the insurer's committee door, then report to the dead drop whose name is behind SKN Capital Nominees.",

        [M06_I18N_KEY.MAIL_TIP_SUBJECT]: "a door that isn't on any map",
        [M06_I18N_KEY.MAIL_TIP_CONTENT]: [
            "I found a strange website. It never comes up in a search. It only answers if you type the address in yourself: {{door}}.",
            "It doesn't say whose it is, and nothing on it looks built for visitors. The login does not ask for a password. It shows a scrambled sentence and waits for the key. I can't read it. You can, if you bring it what it asks for.",
            "",
            "BLACKLEDGER keeps its books in the dark. Somebody keeps the other set in public.",
            "",
            "A nominee company is not a company. It is a mailing address with a signature on file. The register in {{jurisdiction}} keeps every version it was ever given, and that is where the names are: {{registry}}. Read what it says about {{entity}}, then read what it used to say.",
            "",
            "Don't go to the door with a guess. Go with what the register can prove.",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_HOSTS_SUBJECT]: "who runs the machines",
        [M06_I18N_KEY.MAIL_HOSTS_CONTENT]: [
            "The register tells you who is on paper. It does not tell you who runs the machines.",
            "{{hosttrail}} records which certificate a host presents, and who else presents it. Start with the insurer's customer portal: {{portal}}. The door's second lock is built from what you find there.",
            "",
            "While you are at it, ask the registrar who holds the insurer's own domain. A certificate says who runs a machine. A registrar says who paid for the name.",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_AGENT_SUBJECT]: "the agent files what it is told",
        [M06_I18N_KEY.MAIL_AGENT_CONTENT]: [
            "That is the agent. It files what it is told and keeps no names.",
            "A register keeps what it was told before, not only what it was told last. Some of that sits on the site and was never put in the index.",
            "",
            "A tool that walks a site's folders will find what a page won't list. Point it at the register.",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "not yet",
        [M06_I18N_KEY.MAIL_PREMATURE_INTRO]:
            "That is a filing, not a finding. Every line in it has to come from somewhere you've actually been.",
        [M06_I18N_KEY.MAIL_PREMATURE_OUTRO]: "Send it again when the register backs it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_TIP]: "Read what I sent you first. The address is in it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_DOOR_SEEN]:
            "There is an address in my message that no search engine knows. Type it in yourself and read what it asks for before you read anything else.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_REGISTRY]:
            "The door tells you what to bring. The register is where you start looking for it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_NOMINEES]:
            "Read the entity's own record before you read anything about it. Two names sit on it. They are signatures, not owners.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_AGENT]:
            "A nominee keeps an agent. The record names it and the domain it lives on. Ask whoever registered that domain.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILINGS]:
            "A register keeps what it used to say, and not every page of it is linked. A tool that walks a site's folders will find what the index leaves out.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILING_2019]:
            "The oldest filing is sealed. Its key is built from what the page itself prints: the entity's number and the year, joined by dashes. A decrypt desk will open it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILING_2024]:
            "The newer filing is sealed with something the older one told you: its owner's register number, then the day that owner stopped existing.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_HOLDINGS]:
            "Whoever replaced the old owner has a record of its own. Find it by the name the 2024 filing gives, and read who sits on it.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INSURER]:
            "The new owner's shareholder is an insurer. Read its record and compare its board with the one you just read.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INFRA]:
            "Show me the address belongs to them. Ask the registrar who holds the insurer's domain, not the website what it claims.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_DOOR_OPEN]:
            "You have the pieces. The door wants three names in order, the sentence read back by hand against the square they build, and the last four characters of the certificate two hosts share.",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_IDENTITY]:
            "The door is open. Read what is behind it, all the way down to the signature.",

        [M06_I18N_KEY.MAIL_REPORT_SUBJECT]: "Open Register — the name behind the nominee",
        [M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "Name: {{architect}}",
            "Position: {{role}}",
            "Registered agent: {{agent}}",
            "Ownership chain: {{chain}}",
            "Proof of control: {{proof}}",
            "The front: {{front}}",
        ].join("\n"),
        [M06_I18N_KEY.MAIL_REPORT_BODY]: [
            "Name: {{architect}}",
            "Position: {{role}}",
            "Registered agent: {{agent}}",
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
            "In the committee's own minutes he declared his seat on the board of the company that owns the account. The committee judged it immaterial, and he kept the chair.",
        [M06_I18N_KEY.LOG_IDENTITY_2]:
            "None of it is a crime on its own. That is the design. The crime only exists when you put the three filings side by side.",
        [M06_I18N_KEY.LOG_CAPTURE_1]:
            "The archived capture still lists the analyst as the filing contact. The live page does not. Somebody tidied up after us.",
        [M06_I18N_KEY.LOG_CERTIFICATE_1]:
            "The insurer's domain is registered to the same name as the tunnel endpoint the wire transfers walked to. A registrar lists a name on a form. What the machines present is harder to tidy up.",
        [M06_I18N_KEY.LOG_AGENT_1]:
            "Marlowe & Pryce Corporate Services. They hold the company's mail so nobody has to hold its name.",
        [M06_I18N_KEY.LOG_AGENT_2]: "A registered agent exists so that nobody has to be found.",

        [M06_I18N_KEY.OSINT_WHOIS_AGENT_CONTACT]: "Marlowe & Pryce Corporate Services",
        [M06_I18N_KEY.OSINT_WHOIS_INSURER_CONTACT]: "Bulletproof VPN Ltd.",
    },
    zh: {
        [M06_I18N_KEY.QUEST_TITLE]: "公开登记册",
        [M06_I18N_KEY.QUEST_DESCRIPTION]:
            "一扇不在任何地图上的门，要一句只有保险人委员会才读得懂的话。顺着名义公司穿过登记册，找到能打开它的东西。",
        [M06_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "把公开登记册翻到底，直到你能打开保险人的委员会之门，然后把 SKN Capital Nominees 背后的名字报给死信箱。",

        [M06_I18N_KEY.MAIL_TIP_SUBJECT]: "一扇不在任何地图上的门",
        [M06_I18N_KEY.MAIL_TIP_CONTENT]: [
            "我发现了一个奇怪的网站。搜索引擎里永远搜不到它，只有你亲手输入地址它才会应答：{{door}}。",
            "它没有写明属于谁，页面上也没有一处是给访客准备的。登录框不要密码，只给出一句被打乱的话，然后等着钥匙。我读不懂，你可以，前提是你带去它要的东西。",
            "",
            "BLACKLEDGER 把账本藏在暗处。有人把另一套账摆在明处。",
            "",
            "名义公司不是公司。它是一个通信地址，加上一份存档的签名。{{jurisdiction}} 的登记册保留着它收到过的每一个版本，名字就在那里：{{registry}}。先看它现在怎么写 {{entity}}，再看它过去怎么写。",
            "",
            "别拿着猜测去敲那扇门。带着登记册能证明的东西去。",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_HOSTS_SUBJECT]: "谁在运行那些机器",
        [M06_I18N_KEY.MAIL_HOSTS_CONTENT]: [
            "登记册告诉你纸面上是谁。它不会告诉你是谁在运行那些机器。",
            "{{hosttrail}} 会记录一台主机出示的是哪张证书，以及还有谁出示同一张。先从保险人的客户门户 {{portal}} 查起。那扇门的第二把锁，就是用你在那里查到的东西做的。",
            "",
            "顺便问问注册商，保险人自己的域名在谁名下。证书说明谁在运行机器，注册商说明谁替这个名字付了钱。",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_AGENT_SUBJECT]: "代理人只归档别人交来的东西",
        [M06_I18N_KEY.MAIL_AGENT_CONTENT]: [
            "那就是代理人。它只管归档别人交来的东西，不留名字。",
            "登记册保留的是它以前收到的东西，不只是最近一次。其中一部分就放在网站上，却从来没有被写进索引。",
            "",
            "能遍历网站目录的工具，会找到页面不肯列出的东西。把它指向登记册。",
        ].join("\n"),

        [M06_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "还不到时候",
        [M06_I18N_KEY.MAIL_PREMATURE_INTRO]: "那是一份备案，不是一个结论。里面每一行都得来自你真正去过的地方。",
        [M06_I18N_KEY.MAIL_PREMATURE_OUTRO]: "等登记册能替它作证，再发一次。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_TIP]: "先读我发给你的东西。地址就在里面。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_DOOR_SEEN]:
            "我的信里有一个任何搜索引擎都不认识的地址。亲手把它输进去，先看清它要什么，再去看别的。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_REGISTRY]: "那扇门会告诉你该带什么。要找这些东西，从登记册开始。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_NOMINEES]:
            "先读这家实体自己的记录，再读关于它的任何说法。上面有两个名字，它们是签名，不是所有人。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_AGENT]:
            "名义公司都留着代理人。记录里写明了代理人和它所在的域名。去问注册那个域名的人。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILINGS]:
            "登记册会保留它过去的说法，而且不是每一页都有链接。能顺着网站目录一路走下去的工具，会找到索引漏掉的东西。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILING_2019]:
            "最早的那份备案是密封的。钥匙取自页面自己印出的内容：实体编号和年份，用短横线连起来。解密台能打开它。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_FILING_2024]:
            "较新的那份备案，是用旧备案告诉你的东西封存的：旧所有人的登记编号，再加上那个所有人不复存在的日期。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_HOLDINGS]:
            "接替旧所有人的那一方有自己的记录。按 2024 年备案给出的名字去找，看看上面坐着谁。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INSURER]:
            "新所有人的股东是一家保险人。读它的记录，把它的董事会和你刚读过的那一份对一对。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_INFRA]:
            "拿出证据，说明那个地址属于他们。去问注册商保险人的域名在谁名下，别听网站自己怎么写。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_DOOR_OPEN]:
            "零件你都有了。那扇门要按顺序给出三个名字，用它们搭出的方阵手工读出那句话，再加上两台主机共用的那张证书指纹的最后四位。",
        [M06_I18N_KEY.MAIL_PREMATURE_HINT_IDENTITY]: "门开了。把里面的东西读完，一直读到签名。",

        [M06_I18N_KEY.MAIL_REPORT_SUBJECT]: "公开登记册 — 名义公司背后的名字",
        [M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "姓名：{{architect}}",
            "职务：{{role}}",
            "注册代理：{{agent}}",
            "持股链条：{{chain}}",
            "控制证据：{{proof}}",
            "挡在前面的人：{{front}}",
        ].join("\n"),
        [M06_I18N_KEY.MAIL_REPORT_BODY]: [
            "姓名：{{architect}}",
            "职务：{{role}}",
            "注册代理：{{agent}}",
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
            "在委员会自己的纪要里，他申报了自己在持有该账户的公司董事会中的席位。委员会认定无关紧要，他仍然留在主席位上。",
        [M06_I18N_KEY.LOG_IDENTITY_2]:
            "单看每一件都不构成犯罪。这正是设计的用意。只有把三份备案并排放在一起，罪才成立。",
        [M06_I18N_KEY.LOG_CAPTURE_1]:
            "存档快照里，那位分析师还挂着备案联系人。实时页面上已经没有了。有人在我们后面收拾过。",
        [M06_I18N_KEY.LOG_CERTIFICATE_1]:
            "保险人的域名登记在与汇款隧道端点相同的名字之下。注册商记录的只是表格上的名字，机器自己出示的东西就没那么容易收拾干净。",
        [M06_I18N_KEY.LOG_AGENT_1]: "Marlowe & Pryce Corporate Services。他们替公司收信，这样就没有人需要署上自己的名字。",
        [M06_I18N_KEY.LOG_AGENT_2]: "注册代理存在的意义，就是让没有人需要被找到。",

        [M06_I18N_KEY.OSINT_WHOIS_AGENT_CONTACT]: "Marlowe & Pryce Corporate Services",
        [M06_I18N_KEY.OSINT_WHOIS_INSURER_CONTACT]: "防弹 VPN 有限公司",
    },
});
