import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M01_I18N_KEY = {
    QUEST_TITLE: "M01.QUEST.TITLE",
    QUEST_DESCRIPTION: "M01.QUEST.DESCRIPTION",
    OBJECTIVE_REPORT_FINDINGS: "M01.OBJECTIVE.REPORT_FINDINGS",

    MAIL_TIP_SUBJECT: "M01.MAIL.TIP.SUBJECT",
    MAIL_TIP_CONTENT: "M01.MAIL.TIP.CONTENT",
    MAIL_CUSTODIAN_SUBJECT: "M01.MAIL.CUSTODIAN.SUBJECT",
    MAIL_CUSTODIAN_CONTENT: "M01.MAIL.CUSTODIAN.CONTENT",
    MAIL_REPORT_SUBJECT: "M01.MAIL.REPORT.SUBJECT",
    MAIL_REPORT_TEMPLATE_CONTENT: "M01.MAIL.REPORT.TEMPLATE_CONTENT",
    MAIL_REPORT_BODY: "M01.MAIL.REPORT.BODY",

    LEDGER_CONTENT: "M01.LEDGER.CONTENT",
    HACKHUB_POST_CONTENT: "M01.HACKHUB.POST_CONTENT",

    IRC_L01: "M01.IRC.L01",
    IRC_L02: "M01.IRC.L02",
    IRC_L03: "M01.IRC.L03",
    IRC_L04: "M01.IRC.L04",
    IRC_L05: "M01.IRC.L05",
    IRC_L06: "M01.IRC.L06",
    IRC_L07: "M01.IRC.L07",
    IRC_L08: "M01.IRC.L08",
    IRC_L10: "M01.IRC.L10",
    IRC_L11: "M01.IRC.L11",
    IRC_L12: "M01.IRC.L12",
    IRC_L13: "M01.IRC.L13",
    IRC_L14: "M01.IRC.L14",

    DEVICE_LEGACY_CONTENT: "M01.DEVICE.LEGACY_CONTENT",
    DEVICE_BLACKWIRE_GATEWAY_CONTENT: "M01.DEVICE.BLACKWIRE_GATEWAY_CONTENT",
    DEVICE_FROSTGATE_GATEWAY_CONTENT: "M01.DEVICE.FROSTGATE_GATEWAY_CONTENT",
    DEVICE_FROSTGATE_API_CONTENT: "M01.DEVICE.FROSTGATE_API_CONTENT",
    DEVICE_OBSIDIAN_GATEWAY_CONTENT: "M01.DEVICE.OBSIDIAN_GATEWAY_CONTENT",
    DEVICE_OBSIDIAN_API_CONTENT: "M01.DEVICE.OBSIDIAN_API_CONTENT",
    DEVICE_OPS_NOTES_CONTENT: "M01.DEVICE.OPS_NOTES_CONTENT",
    DEVICE_DUMMY_TODO: "M01.DEVICE.DUMMY_TODO",
    DEVICE_DUMMY_README: "M01.DEVICE.DUMMY_README",

    OSINT_LYNX_BLACKWIRE_DOMAIN: "M01.OSINT.LYNX.BLACKWIRE_DOMAIN",
    OSINT_LYNX_BROKER_ALIAS_LOCKED_1: "M01.OSINT.LYNX.BROKER_ALIAS_LOCKED_1",
    OSINT_LYNX_BROKER_ALIAS_LOCKED_2: "M01.OSINT.LYNX.BROKER_ALIAS_LOCKED_2",
    OSINT_LYNX_BROKER_ALIAS_UNLOCKED_1: "M01.OSINT.LYNX.BROKER_ALIAS_UNLOCKED_1",
    OSINT_LYNX_BROKER_ALIAS_UNLOCKED_2: "M01.OSINT.LYNX.BROKER_ALIAS_UNLOCKED_2",
    OSINT_LYNX_BROKER_USERNAME: "M01.OSINT.LYNX.BROKER_USERNAME",
    OSINT_LYNX_TWOTTER_CONTACT: "M01.OSINT.LYNX.TWOTTER_CONTACT",
    OSINT_LYNX_TWOTTER_TRADER: "M01.OSINT.LYNX.TWOTTER_TRADER",
    OSINT_LYNX_FROSTGATE_DOMAIN: "M01.OSINT.LYNX.FROSTGATE_DOMAIN",
} as const;

Localization.registerAll({
    en: {
        [M01_I18N_KEY.QUEST_TITLE]: "First Trace",
        [M01_I18N_KEY.QUEST_DESCRIPTION]:
            "Trace the initial access broker who sold out the hospital's network.",

        [M01_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "Track down the broker who sold access to the hospital's network, get into their operation, and trace it back to their hidden archive -- then report what you find to the dead drop.",

        [M01_I18N_KEY.MAIL_TIP_SUBJECT]: "you should look into this",
        [M01_I18N_KEY.MAIL_TIP_CONTENT]: [
            "Found this while digging through leaked broker chatter -- some kind of access-for-sale operation, dressed up as a legit marketplace on the surface.",
            "",
            "One name keeps coming up: an ops guy who isn't exactly careful about what he posts online. Word is his latest listing moved fast -- healthcare sector, and the buyer paid a premium for a rush job. That should tell you something about who's asking.",
            "",
            "Search around for a handle close to \"opsadmin\". Start there -- the storefront's just the front door. Whatever this guy actually runs lives somewhere deeper, and he's sloppy enough to leave a trail if you're patient.",
            "",
            "Be careful. Whoever runs this isn't small-time.",
        ].join("\n"),

        [M01_I18N_KEY.MAIL_CUSTODIAN_SUBJECT]: "standing instructions",
        [M01_I18N_KEY.MAIL_CUSTODIAN_CONTENT]: [
            "This address is the only channel between us. Whatever you find, however you find it, it comes here -- one report per job, nothing partial, no side conversations.",
            "",
            "I won't confirm receipt and I won't check in. If something's wrong, you'll hear from me. Otherwise assume silence means it's been read and it's enough.",
            "",
            "Keep this address off anything that can be traced back to you. This isn't the only job, and it won't be the last time you use it.",
        ].join("\n"),

        [M01_I18N_KEY.MAIL_REPORT_SUBJECT]: "Broker identified — buyer alias attached",
        [M01_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "FINDINGS",
            "--------",
            "Listing: {{listingCode}}",
            "Broker: {{broker}}",
            "Buyer: {{buyer}}",
            "Case: {{caseId}}",
            "Project: {{project}}",
            "Vault: {{vaultUrl}}",
            "",
            "Summary: initial access into a healthcare network was sold through this storefront, confirmed via the broker's own backend and cross-referenced against a separate ledger tied to the buyer's larger operation. This isn't an isolated listing -- the same buyer alias shows up across multiple past incidents on record.",
            "",
            "Source: storefront listing, broker backend access, IRC confirmation, and the broker's LedgerVault archive.",
        ].join("\n"),
        [M01_I18N_KEY.MAIL_REPORT_BODY]: [
            "FINDINGS",
            "--------",
            "Listing: {{listingCode}}",
            "Broker: {{broker}}",
            "Buyer: {{buyer}}",
            "Case: {{caseId}}",
            "Project: {{project}}",
            "Vault: {{vaultUrl}}",
            "",
            "Summary: initial access into a healthcare network was sold through this storefront, confirmed via the broker's own backend and cross-referenced against a separate ledger tied to the buyer's larger operation. This isn't an isolated listing -- the same buyer alias shows up across multiple past incidents on record.",
            "",
            "Source: storefront listing, broker backend access, IRC confirmation, and the broker's LedgerVault archive.",
        ].join("\n"),

        [M01_I18N_KEY.LEDGER_CONTENT]: [
            "TRANSACTION LOG — VERIFIED ACCESS SALES",
            "==========================================",
            "",
            "ROW {{listingCode}}",
            "Sector: Healthcare",
            "Region: SEA",
            "Buyer: {{buyer}}",
            "Status: CONFIRMED",
            "Payment: Escrow released",
            "Notes: repeat client, requested rush turnaround.",
        ].join("\n"),

        [M01_I18N_KEY.HACKHUB_POST_CONTENT]:
            "Found a broker running access sales into places that should be off-limits. Hospitals. Healthcare. Somebody's paying good money to make sure the wrong people can walk right in. I've had enough of watching this happen and nothing changing. Time to trace it back to whoever's really running this.",

        [M01_I18N_KEY.IRC_L01]: "you're the SEA buyer, right? confirming the alias before we go further",
        [M01_I18N_KEY.IRC_L02]: "yeah. t404. same as on the last two jobs",
        [M01_I18N_KEY.IRC_L03]: "good. listing's already off the main board on my end",
        [M01_I18N_KEY.IRC_L04]: "escrow says released on their side too",
        [M01_I18N_KEY.IRC_L05]: "confirmed here as well. nothing left to argue about",
        [M01_I18N_KEY.IRC_L06]: "how clean is this one going to be",
        [M01_I18N_KEY.IRC_L07]: "clean enough. nobody's traced the listing back yet",
        [M01_I18N_KEY.IRC_L08]: "and the backup copy, still where it was?",
        [M01_I18N_KEY.IRC_L10]: "the .dark one? that hasn't moved in months, right?",
        [M01_I18N_KEY.IRC_L11]: "hasn't. wouldn't touch it even if I wanted to",
        [M01_I18N_KEY.IRC_L12]: "good. keep it that way",
        [M01_I18N_KEY.IRC_L13]: "this one needs to go clean. no loose ends this time",
        [M01_I18N_KEY.IRC_L14]: "copy that. talk when the next one's ready",

        [M01_I18N_KEY.DEVICE_LEGACY_CONTENT]:
            "this box was supposed to be decommissioned in 2024. nobody ever got around to it. nothing useful left here.",
        [M01_I18N_KEY.DEVICE_BLACKWIRE_GATEWAY_CONTENT]:
            "used to route through here before the migration. nobody's decommissioned it properly.",
        [M01_I18N_KEY.DEVICE_FROSTGATE_GATEWAY_CONTENT]:
            "mirror sync job runs off this box. don't touch, don't ask, just let it run.",
        [M01_I18N_KEY.DEVICE_FROSTGATE_API_CONTENT]:
            "internal API gateway, migrated off this box last year. still answers ssh, nothing else running.",
        [M01_I18N_KEY.DEVICE_OBSIDIAN_GATEWAY_CONTENT]:
            "index resync scheduled nightly. same listings as always. nothing to see here.",
        [M01_I18N_KEY.DEVICE_OBSIDIAN_API_CONTENT]:
            "legacy API endpoint. traffic moved to the new cluster months ago. left running out of laziness.",
        [M01_I18N_KEY.DEVICE_OPS_NOTES_CONTENT]:
            "Anything ops-related lives in /logs now, not here. Check there if you need details.",
        [M01_I18N_KEY.DEVICE_DUMMY_TODO]: "renew SSL cert, rotate backup keys, patch kernel this weekend",
        [M01_I18N_KEY.DEVICE_DUMMY_README]: "standard ops box. don't touch prod configs without asking first.",

        [M01_I18N_KEY.OSINT_LYNX_BLACKWIRE_DOMAIN]:
            "Marketplace advertising illicitly obtained network access. Fronted by a third-party CDN.",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_LOCKED_1]:
            "Handle's floating out there with nothing solid attached to it yet -- no domain, no footprint worth chasing.",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_LOCKED_2]:
            "Pull up the transaction listing page first -- nothing here resolves without it.",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_UNLOCKED_1]:
            "Personal domain registered under a near-identical handle. Looks like an old dev/test box he never took down.",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_UNLOCKED_2]:
            "Same weak habits everywhere -- reused passwords turn up across at least three unrelated breach dumps under this handle.",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_USERNAME]:
            "Partial match on an old alias. Current activity traces to a social handle, not this name.",
        [M01_I18N_KEY.OSINT_LYNX_TWOTTER_CONTACT]:
            "Low profile. Mostly reposts and complaints. No public real name on file.",
        [M01_I18N_KEY.OSINT_LYNX_TWOTTER_TRADER]:
            "Day trader. High post volume, all crypto price talk. No connection to any of the above.",
        [M01_I18N_KEY.OSINT_LYNX_FROSTGATE_DOMAIN]:
            "Crypto exchange front, heavy ad spend. Brand chatter mostly traces to a trader posting as @{{handle}}.",
    },
    zh: {
        [M01_I18N_KEY.QUEST_TITLE]: "第一道痕迹",
        [M01_I18N_KEY.QUEST_DESCRIPTION]:
            "追查那个把医院网络访问权限卖出去的初始入侵中间人。",

        [M01_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "查出把医院网络访问权限卖出去的中间人，渗透进他的行动，一路追查到他藏起来的档案库——然后把查到的一切报告到死信箱。",

        [M01_I18N_KEY.MAIL_TIP_SUBJECT]: "你应该查一下这个",
        [M01_I18N_KEY.MAIL_TIP_CONTENT]: [
            "我在翻一批泄露的中间人聊天记录时发现了这个——表面上是个正规市场，实际上在做访问权限买卖的生意。",
            "",
            "有个名字一直反复出现：一个不太注意自己在网上留下什么痕迹的运维人员。听说他最新一单卖得很快——医疗行业，买家还额外加钱要求加急处理。这就说明找他的人不简单。",
            "",
            "去查一个接近\"opsadmin\"的handle。从那里开始——那个商城只是门面。他真正在经营的东西藏得更深，只要你有耐心，他留下的痕迹够多。",
            "",
            "小心点。在背后操盘的人不是小角色。",
        ].join("\n"),

        [M01_I18N_KEY.MAIL_CUSTODIAN_SUBJECT]: "长期指示",
        [M01_I18N_KEY.MAIL_CUSTODIAN_CONTENT]: [
            "这个地址是我们之间唯一的联系渠道。无论你查到什么、怎么查到的，都发到这里——每单任务一份报告，不要交半成品，也不要有其他闲聊。",
            "",
            "我不会确认收到，也不会主动联系你。如果出了问题，你会收到我的消息。否则，沉默就代表报告已读且内容足够。",
            "",
            "别让这个地址出现在任何能追查到你的地方。这不是唯一一单任务，也不会是你最后一次用到这个地址。",
        ].join("\n"),

        [M01_I18N_KEY.MAIL_REPORT_SUBJECT]: "已锁定中间人身份——附买家别名",
        [M01_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "调查结果",
            "--------",
            "挂牌编号：{{listingCode}}",
            "中间人：{{broker}}",
            "买家：{{buyer}}",
            "案件编号：{{caseId}}",
            "项目：{{project}}",
            "档案库：{{vaultUrl}}",
            "",
            "摘要：一份医疗网络的初始访问权限通过这个商城售出，已通过中间人自己的后端确认，并与另一份记录了买家更大规模行动的账本交叉核实。这不是一起孤立的挂牌交易——同一个买家别名在多起以往记录的事件中反复出现。",
            "",
            "来源：商城挂牌信息、中间人后端访问记录、IRC确认对话，以及中间人的LedgerVault档案库。",
        ].join("\n"),
        [M01_I18N_KEY.MAIL_REPORT_BODY]: [
            "调查结果",
            "--------",
            "挂牌编号：{{listingCode}}",
            "中间人：{{broker}}",
            "买家：{{buyer}}",
            "案件编号：{{caseId}}",
            "项目：{{project}}",
            "档案库：{{vaultUrl}}",
            "",
            "摘要：一份医疗网络的初始访问权限通过这个商城售出，已通过中间人自己的后端确认，并与另一份记录了买家更大规模行动的账本交叉核实。这不是一起孤立的挂牌交易——同一个买家别名在多起以往记录的事件中反复出现。",
            "",
            "来源：商城挂牌信息、中间人后端访问记录、IRC确认对话，以及中间人的LedgerVault档案库。",
        ].join("\n"),

        [M01_I18N_KEY.LEDGER_CONTENT]: [
            "交易记录——已核实访问权限销售",
            "==========================================",
            "",
            "记录 {{listingCode}}",
            "行业：医疗",
            "地区：东南亚",
            "买家：{{buyer}}",
            "状态：已确认",
            "付款：托管资金已释放",
            "备注：回头客，要求加急处理。",
        ].join("\n"),

        [M01_I18N_KEY.HACKHUB_POST_CONTENT]:
            "发现一个中间人在贩卖本该严禁进入的地方的访问权限。医院。医疗系统。有人正花大价钱确保不该进去的人能大摇大摆地闯进去。我受够了眼睁睁看着这种事发生却什么都没改变。是时候把它一路追查到幕后真正的操盘者了。",

        [M01_I18N_KEY.IRC_L01]: "你是东南亚那边的买家吧？先确认一下别名再继续。",
        [M01_I18N_KEY.IRC_L02]: "对，t404。跟前两单一样。",
        [M01_I18N_KEY.IRC_L03]: "好。挂牌在我这边已经从主板下架了。",
        [M01_I18N_KEY.IRC_L04]: "托管那边也显示已释放。",
        [M01_I18N_KEY.IRC_L05]: "这边也确认了。没什么好争的了。",
        [M01_I18N_KEY.IRC_L06]: "这次能干净到什么程度？",
        [M01_I18N_KEY.IRC_L07]: "够干净。目前没人追查到这个挂牌。",
        [M01_I18N_KEY.IRC_L08]: "备份还在原来的地方？",
        [M01_I18N_KEY.IRC_L10]: "那个.dark域名？已经好几个月没变了吧？",
        [M01_I18N_KEY.IRC_L11]: "没变。就算我想动也不会去碰它。",
        [M01_I18N_KEY.IRC_L12]: "好，保持这样。",
        [M01_I18N_KEY.IRC_L13]: "这一单必须干净收尾。这次不能留尾巴。",
        [M01_I18N_KEY.IRC_L14]: "收到。下一单准备好了再联系。",

        [M01_I18N_KEY.DEVICE_LEGACY_CONTENT]:
            "这台机器本来该在2024年就报废下线，结果一直没人处理。这里已经没什么有用的东西了。",
        [M01_I18N_KEY.DEVICE_BLACKWIRE_GATEWAY_CONTENT]:
            "迁移之前流量是走这里的。一直没人正式把它下线。",
        [M01_I18N_KEY.DEVICE_FROSTGATE_GATEWAY_CONTENT]:
            "镜像同步任务就是从这台机器跑的。别碰，别问，让它自己跑就行。",
        [M01_I18N_KEY.DEVICE_FROSTGATE_API_CONTENT]:
            "内部API网关，去年就已经从这台机器迁走了。现在还能ssh进来，其他服务都没在跑了。",
        [M01_I18N_KEY.DEVICE_OBSIDIAN_GATEWAY_CONTENT]:
            "索引重同步每晚定时跑。列表内容一如既往。这里没什么好看的。",
        [M01_I18N_KEY.DEVICE_OBSIDIAN_API_CONTENT]:
            "老旧的API端点。流量几个月前就迁到新集群了。留着它跑纯粹是因为懒得关。",
        [M01_I18N_KEY.DEVICE_OPS_NOTES_CONTENT]:
            "所有跟运维相关的东西现在都放在/logs里，不在这。要看细节去那边查。",
        [M01_I18N_KEY.DEVICE_DUMMY_TODO]: "续期SSL证书，轮换备份密钥，这周末打内核补丁",
        [M01_I18N_KEY.DEVICE_DUMMY_README]: "标准运维机器。未经确认不要动生产环境配置。",

        [M01_I18N_KEY.OSINT_LYNX_BLACKWIRE_DOMAIN]:
            "一个销售非法获取的网络访问权限的市场平台，前端套了第三方CDN。",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_LOCKED_1]:
            "这个handle在网上零星出现，但还没查到任何实质关联——没有域名，也没有值得深挖的痕迹。",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_LOCKED_2]:
            "先去看交易挂牌页面——不看那个，这里的线索都对不上。",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_UNLOCKED_1]:
            "用一个几乎一样的handle注册了个人域名。看起来像是一台他一直没关掉的旧开发/测试机器。",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_UNLOCKED_2]:
            "到处都是同样的坏习惯——用这个handle注册的重复密码，在至少三份互不相关的泄露数据里都出现过。",
        [M01_I18N_KEY.OSINT_LYNX_BROKER_USERNAME]:
            "跟一个旧别名部分匹配。目前的活动痕迹指向一个社交账号handle，不是这个名字。",
        [M01_I18N_KEY.OSINT_LYNX_TWOTTER_CONTACT]:
            "存在感很低。内容大多是转发和抱怨。公开资料里查不到真实姓名。",
        [M01_I18N_KEY.OSINT_LYNX_TWOTTER_TRADER]:
            "日内交易者。发帖量很大，全都是加密货币行情话题。跟上面提到的这些都没有关联。",
        [M01_I18N_KEY.OSINT_LYNX_FROSTGATE_DOMAIN]:
            "加密货币交易所门面，广告投入很大。品牌相关讨论大多能追踪到一个以@{{handle}}发帖的交易者。",
    },
});
