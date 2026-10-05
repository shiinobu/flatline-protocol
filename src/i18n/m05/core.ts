import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M05_I18N_KEY = {
    QUEST_TITLE: "M05.QUEST.TITLE",
    QUEST_DESCRIPTION: "M05.QUEST.DESCRIPTION",
    OBJECTIVE_REPORT_FINDINGS: "M05.OBJECTIVE.REPORT_FINDINGS",

    MAIL_TIP_SUBJECT: "M05.MAIL.TIP.SUBJECT",
    MAIL_TIP_CONTENT: "M05.MAIL.TIP.CONTENT",
    MAIL_PREMATURE_SUBJECT: "M05.MAIL.PREMATURE.SUBJECT",
    MAIL_PREMATURE_INTRO: "M05.MAIL.PREMATURE.INTRO",
    MAIL_PREMATURE_OUTRO: "M05.MAIL.PREMATURE.OUTRO",
    MAIL_PREMATURE_HINT_VAULT: "M05.MAIL.PREMATURE.HINT_VAULT",
    MAIL_PREMATURE_HINT_TEAM: "M05.MAIL.PREMATURE.HINT_TEAM",
    MAIL_PREMATURE_HINT_CHANGE: "M05.MAIL.PREMATURE.HINT_CHANGE",
    MAIL_PREMATURE_HINT_ARCHIVE: "M05.MAIL.PREMATURE.HINT_ARCHIVE",
    MAIL_PREMATURE_HINT_IDENTITY: "M05.MAIL.PREMATURE.HINT_IDENTITY",
    MAIL_PREMATURE_HINT_HANDOVER: "M05.MAIL.PREMATURE.HINT_HANDOVER",
    MAIL_PREMATURE_HINT_CREDENTIAL: "M05.MAIL.PREMATURE.HINT_CREDENTIAL",
    MAIL_PREMATURE_HINT_PORTAL: "M05.MAIL.PREMATURE.HINT_PORTAL",
    MAIL_PREMATURE_HINT_FOOTHOLD: "M05.MAIL.PREMATURE.HINT_FOOTHOLD",
    MAIL_PREMATURE_HINT_SEPARATION: "M05.MAIL.PREMATURE.HINT_SEPARATION",
    MAIL_PREMATURE_HINT_CONTROLS: "M05.MAIL.PREMATURE.HINT_CONTROLS",
    MAIL_PREMATURE_HINT_HOLD: "M05.MAIL.PREMATURE.HINT_HOLD",
    MAIL_PREMATURE_HINT_SYSTEMS: "M05.MAIL.PREMATURE.HINT_SYSTEMS",
    MAIL_PREMATURE_HINT_TOKEN: "M05.MAIL.PREMATURE.HINT_TOKEN",
    MAIL_PREMATURE_HINT_DISPLAY: "M05.MAIL.PREMATURE.HINT_DISPLAY",
    MAIL_PREMATURE_HINT_DOCUMENTS: "M05.MAIL.PREMATURE.HINT_DOCUMENTS",
    MAIL_REPORT_SUBJECT: "M05.MAIL.REPORT.SUBJECT",
    MAIL_REPORT_TEMPLATE_CONTENT: "M05.MAIL.REPORT.TEMPLATE_CONTENT",
    MAIL_REPORT_BODY: "M05.MAIL.REPORT.BODY",

    DOC_FOUND_NOTE: "M05.DOC.FOUND_NOTE",
    DOC_USB_HISTORY: "M05.DOC.USB_HISTORY",
    DOC_DECOY_PACS: "M05.DOC.DECOY_PACS",
    DOC_DECOY_BILLING: "M05.DOC.DECOY_BILLING",

    OSINT_LYNX_GRETA_1: "M05.OSINT.LYNX.GRETA_1",
    OSINT_LYNX_GRETA_2: "M05.OSINT.LYNX.GRETA_2",
    OSINT_LYNX_GRETA_3: "M05.OSINT.LYNX.GRETA_3",
    OSINT_LYNX_GARETH_1: "M05.OSINT.LYNX.GARETH_1",
    OSINT_LYNX_GARETH_2: "M05.OSINT.LYNX.GARETH_2",
    OSINT_WHOIS_HOSPITAL_CONTACT: "M05.OSINT.WHOIS.HOSPITAL_CONTACT",

    LOG_DISMISSED_1: "M05.LOG.DISMISSED.1",
    LOG_GRETA_1: "M05.LOG.GRETA.1",
    LOG_GRETA_2: "M05.LOG.GRETA.2",
    LOG_FOOTHOLD_1: "M05.LOG.FOOTHOLD.1",
    LOG_SEPARATION_1: "M05.LOG.SEPARATION.1",
    LOG_CONTROLS_1: "M05.LOG.CONTROLS.1",
    LOG_HOLD_1: "M05.LOG.HOLD.1",
    LOG_ARCHIVE_1: "M05.LOG.ARCHIVE.1",
    LOG_STATEMENT_1: "M05.LOG.STATEMENT.1",
    LOG_STATEMENT_2: "M05.LOG.STATEMENT.2",
    LOG_MEMO_1: "M05.LOG.MEMO.1",
    LOG_MEMO_2: "M05.LOG.MEMO.2",
    LOG_TICKET_1: "M05.LOG.TICKET.1",
    LOG_TICKET_2: "M05.LOG.TICKET.2",
    LOG_STATUS_1: "M05.LOG.STATUS.1",
    LOG_GRETA_NOTE_1: "M05.LOG.GRETA_NOTE.1",
    LOG_GRETA_NOTE_2: "M05.LOG.GRETA_NOTE.2",
    LOG_NOTES_1: "M05.LOG.NOTES.1",
    LOG_NOTES_2: "M05.LOG.NOTES.2",
    LOG_BEDSIDE_1: "M05.LOG.BEDSIDE.1",
} as const;

Localization.registerAll({
    en: {
        [M05_I18N_KEY.QUEST_TITLE]: "The Door",
        [M05_I18N_KEY.QUEST_DESCRIPTION]:
            "Find out who the hospital named as the way in, and who decided to name them.",
        [M05_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "The hospital's public statement says a network issue. Find the person their own file calls the cause, find who signed that file, and report what actually happened to the dead drop.",

        [M05_I18N_KEY.MAIL_TIP_SUBJECT]: "the note in the vault",
        [M05_I18N_KEY.MAIL_TIP_CONTENT]: [
            "Go back to the vault and open the hospital project again.",
            "There is a scan in there of a sticky note somebody wrote by hand, signed with three initials.",
            "",
            "Those initials are a person. They still have a name, a job title, and a reason they are no longer listed anywhere.",
            "Find out who they are, and find out who decided they were the cause.",
        ].join("\n"),

        [M05_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "not yet",
        [M05_I18N_KEY.MAIL_PREMATURE_INTRO]:
            "That is a story, not a finding. Every line in it has to come from somewhere you've actually been.",
        [M05_I18N_KEY.MAIL_PREMATURE_OUTRO]: "Send it again when their own file says it.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_VAULT]: "Start at the vault. The note is already in your evidence.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_TEAM]:
            "A hospital lists the people who run its systems. Find that page.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_ARCHIVE]:
            "Look at who is missing, not at who is there. Pages change; find what this one used to say.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_CHANGE]:
            "The page that lists the team also points at a vacancy. A vacancy has a reference, and a reference has a record.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_IDENTITY]:
            "Match the initials to the former names. Only one of them held the seat that is now a vacancy.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_CREDENTIAL]:
            "A recovery format is sealed too. It was filed under the reference that closed the role.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_HANDOVER]:
            "A note was sealed for whoever held the seat. A cipher desk opens it for the right account name.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_PORTAL]:
            "The page that lists the team also tells staff where to sign in from outside.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_FOOTHOLD]:
            "A sign-in log shows who came from where. One source belongs to no one here.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_SEPARATION]: "A person who has left leaves a ticket behind.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_CONTROLS]:
            "Find what changed the day the sync failed. Some of what the portal holds is sealed; a tool for that is in the open.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_HOLD]: "Someone locked the archive. Find who, and when.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_SYSTEMS]:
            "The portal lists what it manages, and a ticket carries a string nobody explains.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_TOKEN]: "A token is five parts. Build the one for the machine you want.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_DISPLAY]: "The screen is not showing the machine yet.",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_DOCUMENTS]: "You are inside and you have not read all of it.",

        [M05_I18N_KEY.MAIL_REPORT_SUBJECT]: "The Door — who the hospital named",
        [M05_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "Named as the way in: {{door}}",
            "Cause on file: {{cause}}",
            "Signed off by: {{decider}}",
            "",
            "Locked to paid: {{gap}}",
            "Reason: {{motive}}",
            "Records pulled from: {{archive}}",
        ].join("\n"),
        [M05_I18N_KEY.MAIL_REPORT_BODY]: [
            "Named as the way in: {{door}}",
            "Cause on file: {{cause}}",
            "Signed off by: {{decider}}",
            "",
            "Locked to paid: {{gap}}",
            "Reason: {{motive}}",
            "Records pulled from: {{archive}}",
        ].join("\n"),

        [M05_I18N_KEY.DOC_FOUND_NOTE]: "{{label}} -- what does it mean? -- R.a.N",
        [M05_I18N_KEY.DOC_USB_HISTORY]: [
            "{{usbDate}} {{usbTime}} UTC  mass storage attached  label={{label}}",
            "{{usbDate}} {{usbTime}} UTC  autorun handler invoked",
        ].join("\n"),
        [M05_I18N_KEY.DOC_DECOY_PACS]: "imaging archive mount. nothing here but studies.",
        [M05_I18N_KEY.DOC_DECOY_BILLING]: "claims export staging. cleared nightly.",

        [M05_I18N_KEY.OSINT_LYNX_GRETA_1]:
            "Systems Administrator at a regional hospital group. Posts about work she should not post about.",
        [M05_I18N_KEY.OSINT_LYNX_GRETA_2]:
            "In August she found a USB stick on her desk with a project code on it and asked publicly what it meant.",
        [M05_I18N_KEY.OSINT_LYNX_GRETA_3]:
            "Her last post says they want her to sign something. Nothing after that.",
        [M05_I18N_KEY.OSINT_LYNX_GARETH_1]:
            "IT contractor, same hospital group. Cheerful leaving post in July when his contract ended.",
        [M05_I18N_KEY.OSINT_LYNX_GARETH_2]:
            "Nothing since. His badge stopped working before any of this happened.",
        [M05_I18N_KEY.OSINT_WHOIS_HOSPITAL_CONTACT]: "PacificCare Health — Network Operations",

        [M05_I18N_KEY.LOG_DISMISSED_1]:
            "Roxanne Anindita Natnaree held the Systems Administrator seat on 30 June and was gone by 18 August. SA-0826 reopens that exact seat.",
        [M05_I18N_KEY.LOG_GRETA_1]:
            "Her public posts keep coming back to OT3, to the night of 0814, and to old access that outlives a migration.",
        [M05_I18N_KEY.LOG_GRETA_2]: "None of it is a password. It tells you which of the hospital's own records to read again.",
        [M05_I18N_KEY.LOG_FOOTHOLD_1]:
            "The first sign-in with her credentials from outside came from 194.36.108.20 on 2026-08-11 at 00:41 UTC.",
        [M05_I18N_KEY.LOG_SEPARATION_1]:
            "Her account closure was requested on 2026-08-19 and never actioned.",
        [M05_I18N_KEY.LOG_CONTROLS_1]:
            "On 2026-06-30 directory sync was paused and removable-media enforcement set to log-only. Neither was reverted, and that is why the closure could not be actioned.",
        [M05_I18N_KEY.LOG_HOLD_1]:
            "The incident archive was put under Legal hold at 05:20 UTC on 2026-08-14, approved by the CRO's account.",
        [M05_I18N_KEY.LOG_ARCHIVE_1]:
            "Her own credentials opened the screen of the held archive. The account that was supposed to be closed was the way in.",
        [M05_I18N_KEY.LOG_STATEMENT_1]:
            "The draft said a vendor tool. The final said her. Four days apart, same office.",
        [M05_I18N_KEY.LOG_STATEMENT_2]:
            "They did not pick her because she was careless. They picked her because negligence kept the claim inside cover.",
        [M05_I18N_KEY.LOG_MEMO_1]:
            "05:12, Operating Theatre 3: escalated to Legal, excluded from the external statement.",
        [M05_I18N_KEY.LOG_MEMO_2]:
            "Paid at 09:02, filed under negligence. The money moved faster than the explanation.",
        [M05_I18N_KEY.LOG_TICKET_1]: "Q3-2026-SEA. The same label as the folder in the broker's vault.",
        [M05_I18N_KEY.LOG_TICKET_2]:
            "Plugged in at 00:12 on August 11th, three days before they locked the hospital.",
        [M05_I18N_KEY.LOG_STATUS_1]: "Theatre 3 is not a system. The status page keeps calling it one.",
        [M05_I18N_KEY.LOG_GRETA_NOTE_1]:
            "One password for the portal, the VPN, the archive and MedVendor. The reset was always after the migration.",
        [M05_I18N_KEY.LOG_GRETA_NOTE_2]: "The migration never ends. That is the whole door, in her own words.",
        [M05_I18N_KEY.LOG_NOTES_1]: "She plugged it in because the label looked like a project code. That is it.",
        [M05_I18N_KEY.LOG_NOTES_2]: "She keeps coming back to the theatre. So does the memo, in a line they removed.",
        [M05_I18N_KEY.LOG_BEDSIDE_1]:
            "The note from the vault was real. It was sitting on the machine the whole time.",
    },
    zh: {
        [M05_I18N_KEY.QUEST_TITLE]: "那扇门",
        [M05_I18N_KEY.QUEST_DESCRIPTION]: "查出医院把谁说成了入口，以及是谁决定这么写的。",
        [M05_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "医院对外的说法是“网络故障”。找出他们自己档案里被定为原因的那个人，找出是谁签了那份档案，再把真正发生的事报给死信箱。",

        [M05_I18N_KEY.MAIL_TIP_SUBJECT]: "保险库里的那张便条",
        [M05_I18N_KEY.MAIL_TIP_CONTENT]: [
            "回到保险库，再打开那个医院项目。",
            "里面有一张扫描件，是某人手写的便条，签名是三个首字母。",
            "",
            "那几个首字母是一个人。她仍然有名字、有职位，也有一个再也不出现在任何名单上的原因。",
            "查出她是谁，再查出是谁认定她就是原因。",
        ].join("\n"),

        [M05_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "还不到时候",
        [M05_I18N_KEY.MAIL_PREMATURE_INTRO]: "那是个故事，不是结论。里面每一行都得来自你真正去过的地方。",
        [M05_I18N_KEY.MAIL_PREMATURE_OUTRO]: "等他们自己的档案这么写了，再发一次。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_VAULT]: "从保险库开始。那张便条已经在你的证据里了。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_TEAM]: "医院会列出负责系统的人。找到那张页面。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_ARCHIVE]: "看谁不见了，而不是看谁还在。页面会改，去找它以前写的是什么。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_PORTAL]: "列出团队的那张页面，也告诉员工从外部在哪里登录。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_FOOTHOLD]: "登录日志会显示谁从哪里来。有一个来源不属于这里的任何人。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_SEPARATION]: "一个已经离开的人，会留下一张工单。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_CONTROLS]:
            "去找同步失败那天改了什么。门户里有些东西是封存的；解封的工具就在明处。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_HOLD]: "有人锁住了档案。找出是谁，什么时候。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_SYSTEMS]: "门户列出了它管理的东西，而一张工单里有一串没人解释的字符。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_TOKEN]: "令牌由五部分组成。为你想进的那台机器拼出它。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_DISPLAY]: "屏幕还没显示那台机器。",
        [M05_I18N_KEY.MAIL_PREMATURE_HINT_DOCUMENTS]: "你已经进去了，但还没把里面读完。",

        [M05_I18N_KEY.MAIL_REPORT_SUBJECT]: "那扇门 — 医院点了谁的名",
        [M05_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: [
            "被定为入口：{{door}}",
            "档案上的原因：{{cause}}",
            "签字的人：{{decider}}",
            "",
            "从锁定到付款：{{gap}}",
            "动机：{{motive}}",
            "记录来源：{{archive}}",
        ].join("\n"),
        [M05_I18N_KEY.MAIL_REPORT_BODY]: [
            "被定为入口：{{door}}",
            "档案上的原因：{{cause}}",
            "签字的人：{{decider}}",
            "",
            "从锁定到付款：{{gap}}",
            "动机：{{motive}}",
            "记录来源：{{archive}}",
        ].join("\n"),

        [M05_I18N_KEY.DOC_FOUND_NOTE]: "{{label}} —— 这是什么意思？—— R.a.N",
        [M05_I18N_KEY.DOC_USB_HISTORY]: [
            "{{usbDate}} {{usbTime}} UTC  已接入大容量存储  label={{label}}",
            "{{usbDate}} {{usbTime}} UTC  已调用自动运行处理程序",
        ].join("\n"),
        [M05_I18N_KEY.DOC_DECOY_PACS]: "影像归档挂载点。这里除了检查片子什么都没有。",
        [M05_I18N_KEY.DOC_DECOY_BILLING]: "理赔导出暂存区。每晚清空。",

        [M05_I18N_KEY.OSINT_LYNX_GRETA_1]: "某区域医院集团的系统管理员。总在网上发她不该发的工作内容。",
        [M05_I18N_KEY.OSINT_LYNX_GRETA_2]: "八月她在桌上发现一个写着项目代号的 U 盘，还公开问那是什么意思。",
        [M05_I18N_KEY.OSINT_LYNX_GRETA_3]: "她最后一条帖子说，他们要她签个东西。之后再没有动静。",
        [M05_I18N_KEY.OSINT_LYNX_GARETH_1]: "同一家医院集团的 IT 外包。七月合同到期时发了条挺开心的告别帖。",
        [M05_I18N_KEY.OSINT_LYNX_GARETH_2]: "之后再没发过。他的门禁卡在这些事发生之前就已经失效了。",
        [M05_I18N_KEY.OSINT_WHOIS_HOSPITAL_CONTACT]: "PacificCare 医院 — 网络运维",

        [M05_I18N_KEY.LOG_FOOTHOLD_1]:
            "用她的凭据从外部的第一次登录来自 194.36.108.20，时间是 2026-08-11 00:41 UTC。",
        [M05_I18N_KEY.LOG_SEPARATION_1]: "她的账号注销请求在 2026-08-19 提出，却从未执行。",
        [M05_I18N_KEY.LOG_CONTROLS_1]:
            "2026-06-30 目录同步被暂停，可移动介质管控被降为仅记录。两者都没恢复，这正是注销无法执行的原因。",
        [M05_I18N_KEY.LOG_HOLD_1]:
            "事件档案在 2026-08-14 05:20 UTC 被置于法务封存，由首席风险官的账号批准。",
        [M05_I18N_KEY.LOG_ARCHIVE_1]:
            "是她自己的凭据打开了被封存档案的屏幕。本该被关闭的那个账号，就是入口。",
        [M05_I18N_KEY.LOG_STATEMENT_1]: "草案写的是某个厂商工具。最终版写的是她。相隔四天，同一个办公室。",
        [M05_I18N_KEY.LOG_STATEMENT_2]:
            "他们选她，不是因为她粗心。他们选她，是因为“过失”能让理赔留在承保范围内。",
        [M05_I18N_KEY.LOG_MEMO_1]: "05:12，三号手术室：已上报法务，不纳入对外声明。",
        [M05_I18N_KEY.LOG_MEMO_2]: "09:02 付款，归入疏忽。钱走得比解释还快。",
        [M05_I18N_KEY.LOG_TICKET_1]: "Q3-2026-SEA。和经纪人保险库里那个文件夹是同一个标签。",
        [M05_I18N_KEY.LOG_TICKET_2]: "8 月 11 日 00:12 插入，三天之后他们锁住了医院。",
        [M05_I18N_KEY.LOG_STATUS_1]: "第三手术室不是系统。状态页却一直把它当成系统。",
        [M05_I18N_KEY.LOG_GRETA_NOTE_1]: "门户、VPN、档案、MedVendor 都是同一个密码。强制重置永远排在迁移之后。",
        [M05_I18N_KEY.LOG_GRETA_NOTE_2]: "迁移永远不会结束。用她自己的话说，这就是那扇门。",
        [M05_I18N_KEY.LOG_NOTES_1]: "她插上它，是因为那个标签看起来像项目代号。就这么简单。",
        [M05_I18N_KEY.LOG_NOTES_2]: "她一直绕回那间手术室。那份备忘录也一样——在他们删掉的那一行里。",
        [M05_I18N_KEY.LOG_BEDSIDE_1]: "保险库里那张便条是真的。它一直就躺在那台机器上。",
    },
});
