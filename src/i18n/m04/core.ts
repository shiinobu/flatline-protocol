import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M04_I18N_KEY = {
    QUEST_TITLE: "M04.QUEST.TITLE",
    QUEST_DESCRIPTION: "M04.QUEST.DESCRIPTION",
    OBJECTIVE_REPORT_FINDINGS: "M04.OBJECTIVE.REPORT_FINDINGS",

    MAIL_WARNING_SUBJECT: "M04.MAIL.WARNING.SUBJECT",
    MAIL_WARNING_CONTENT: "M04.MAIL.WARNING.CONTENT",
    MAIL_STRIKE1_SUBJECT: "M04.MAIL.STRIKE1.SUBJECT",
    MAIL_STRIKE1_CONTENT: "M04.MAIL.STRIKE1.CONTENT",
    MAIL_PREMATURE_SUBJECT: "M04.MAIL.PREMATURE.SUBJECT",
    MAIL_PREMATURE_INTRO: "M04.MAIL.PREMATURE.INTRO",
    MAIL_PREMATURE_OUTRO: "M04.MAIL.PREMATURE.OUTRO",
    MAIL_PREMATURE_HINT_WARNING: "M04.MAIL.PREMATURE.HINT_WARNING",
    MAIL_PREMATURE_HINT_PROBE: "M04.MAIL.PREMATURE.HINT_PROBE",
    MAIL_PREMATURE_HINT_REPEL: "M04.MAIL.PREMATURE.HINT_REPEL",
    MAIL_REPORT_SUBJECT: "M04.MAIL.REPORT.SUBJECT",
    MAIL_REPORT_TEMPLATE_CONTENT: "M04.MAIL.REPORT.TEMPLATE_CONTENT",
    MAIL_REPORT_BODY: "M04.MAIL.REPORT.BODY",

    BANNER_LABEL: "M04.BANNER.LABEL",
    BANNER_CRITICAL: "M04.BANNER.CRITICAL",
    BANNER_DETAIL: "M04.BANNER.DETAIL",
    BANNER_SEVERED: "M04.BANNER.SEVERED",
    BANNER_SEVERED_DETAIL: "M04.BANNER.SEVERED_DETAIL",
    BANNER_BREACHED: "M04.BANNER.BREACHED",
    BANNER_BREACHED_DETAIL: "M04.BANNER.BREACHED_DETAIL",
    TOAST_STRIKE: "M04.TOAST.STRIKE",

    DEVICE_FIREWALL_LOG: "M04.DEVICE.FIREWALL_LOG",

    OSINT_WHOIS_CONTROL_CONTACT: "M04.OSINT.WHOIS.CONTROL_CONTACT",
} as const;

Localization.registerAll({
    en: {
        [M04_I18N_KEY.QUEST_TITLE]: "Burn Notice",
        [M04_I18N_KEY.QUEST_DESCRIPTION]:
            "Somebody is working your own machine. Find out who is looking for you, and make them stop.",
        [M04_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "Someone came back down the line you left open. Hold them off your own machine, follow the hops they came through, and report who was looking to the dead drop.",

        [M04_I18N_KEY.MAIL_WARNING_SUBJECT]: "something's wrong",
        [M04_I18N_KEY.MAIL_WARNING_CONTENT]: [
            "I said you would hear from me if something was wrong. Something is wrong.",
            "A rule you left open on the finance network got audited, and whoever read that audit did not file it.",
            "",
            "Stay off the endpoint. It is not the endpoint that is moving.",
            "Find out who is looking for you, and do it from your own side of the wire.",
        ].join("\n"),

        [M04_I18N_KEY.MAIL_STRIKE1_SUBJECT]: "you left a door open",
        [M04_I18N_KEY.MAIL_STRIKE1_CONTENT]: [
            "saw your traffic. i am already in your firewall log, and i am not the only thing in there.",
            "cut me off before i finish, if you can work out which line is me.",
        ].join("\n"),

        [M04_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "not yet",
        [M04_I18N_KEY.MAIL_PREMATURE_INTRO]:
            "You are still being worked on. Every line in a report has to come from somewhere you've actually been.",
        [M04_I18N_KEY.MAIL_PREMATURE_OUTRO]: "Send it again when they are off you.",
        [M04_I18N_KEY.MAIL_PREMATURE_HINT_WARNING]: "Read what I sent you first.",
        [M04_I18N_KEY.MAIL_PREMATURE_HINT_PROBE]: "Nothing has touched you yet. Wait for it.",
        [M04_I18N_KEY.MAIL_PREMATURE_HINT_REPEL]: "Something is still inside. Your own logs name it.",

        [M04_I18N_KEY.MAIL_REPORT_SUBJECT]: "Burn Notice — who was looking",
        [M04_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: ["Hunter: {{hunter}}", "Contained: {{contained}}"].join("\n"),
        [M04_I18N_KEY.MAIL_REPORT_BODY]: ["Hunter: {{hunter}}", "Contained: {{contained}}"].join("\n"),

        [M04_I18N_KEY.BANNER_LABEL]: "INCOMING CONNECTION",
        [M04_I18N_KEY.BANNER_CRITICAL]: "TRACE CRITICAL",
        [M04_I18N_KEY.BANNER_DETAIL]: "Unauthorized session on your firewall. Your own log names the source.",
        [M04_I18N_KEY.BANNER_SEVERED]: "CONNECTION SEVERED",
        [M04_I18N_KEY.BANNER_SEVERED_DETAIL]: "The session is cut. They know you noticed.",
        [M04_I18N_KEY.BANNER_BREACHED]: "TRACE COMPLETE",
        [M04_I18N_KEY.BANNER_BREACHED_DETAIL]: "They finished before you did.",
        [M04_I18N_KEY.TOAST_STRIKE]: "Unusual activity on your own firewall.",

        [M04_I18N_KEY.DEVICE_FIREWALL_LOG]: [
            "Sep 24 02:20:11 ghostwire kernel: [fw] ACCEPT out 443 mirror.update.pool",
            "Sep 24 02:23:48 ghostwire ntpd[641]: adjusting local clock by -0.183s",
            "Sep 24 02:31:02 ghostwire kernel: [fw] ACCEPT out 443 cdn-edge-14",
            "Sep 24 02:38:55 ghostwire kernel: [fw] DROP in 443 {{scannerA}} (handshake failed 1/6)",
            "Sep 24 02:39:01 ghostwire kernel: [fw] DROP in 443 {{scannerA}} (handshake failed 4/6)",
            "Sep 24 02:39:07 ghostwire kernel: [fw] DROP in 443 {{scannerA}} (handshake failed 6/6, source released)",
            "Sep 24 02:44:19 ghostwire kernel: [fw] DROP in 22 {{scannerB}} (no service)",
            "Sep 24 02:44:26 ghostwire kernel: [fw] DROP in 22 {{scannerB}} (no service, source released)",
            "Sep 24 02:51:33 ghostwire sshd[1182]: Did not receive identification string from {{scannerB}}",
            "Sep 24 02:58:40 ghostwire kernel: [fw] ACCEPT in 443 {{intruder}} (session established)",
            "Sep 24 02:58:41 ghostwire authd[903]: session {{intruder}} holds uid 0",
            "Sep 24 02:59:41 ghostwire kernel: [fw] ACCEPT out 443 {{intruder}} (beacon, interval {{interval}}s)",
            "Sep 24 03:00:41 ghostwire kernel: [fw] ACCEPT out 443 {{intruder}} (beacon, interval {{interval}}s)",
            "Sep 24 03:04:52 ghostwire kernel: [fw] ACCEPT out 443 mirror.update.pool",
        ].join("\n"),

        [M04_I18N_KEY.OSINT_WHOIS_CONTROL_CONTACT]: "Bulletproof VPN Ltd.",
    },
    zh: {
        [M04_I18N_KEY.QUEST_TITLE]: "烧毁通知",
        [M04_I18N_KEY.QUEST_DESCRIPTION]: "有人正在对你自己的机器下手。查出是谁在找你，然后让他们停下。",
        [M04_I18N_KEY.OBJECTIVE_REPORT_FINDINGS]:
            "有人顺着你留下的那条线回来了。把他们从你自己的机器上挡开，顺着他们经过的跳板往回查，再把到底是谁在找你报给死信箱。",

        [M04_I18N_KEY.MAIL_WARNING_SUBJECT]: "出事了",
        [M04_I18N_KEY.MAIL_WARNING_CONTENT]: [
            "我说过，出事了你会听到我的消息。现在出事了。",
            "你在财务网络上留下的一条规则被审计到了，而读到那份审计的人并没有把它上报。",
            "",
            "离那个端点远一点。动的不是端点。",
            "查出是谁在找你，而且要从你自己这一侧的线上查。",
        ].join("\n"),

        [M04_I18N_KEY.MAIL_STRIKE1_SUBJECT]: "你留了一扇门没关",
        [M04_I18N_KEY.MAIL_STRIKE1_CONTENT]: [
            "看到你的流量了。我已经在你的防火墙日志里，而且里面不止我一个。",
            "在我做完之前把我切掉——前提是你能分辨出哪一行是我。",
        ].join("\n"),

        [M04_I18N_KEY.MAIL_PREMATURE_SUBJECT]: "还不到时候",
        [M04_I18N_KEY.MAIL_PREMATURE_INTRO]: "他们还在对你下手。报告里每一行都得来自你真正去过的地方。",
        [M04_I18N_KEY.MAIL_PREMATURE_OUTRO]: "等他们从你身上下来，再发一次。",
        [M04_I18N_KEY.MAIL_PREMATURE_HINT_WARNING]: "先读我发给你的东西。",
        [M04_I18N_KEY.MAIL_PREMATURE_HINT_PROBE]: "还没有东西碰到你。等着。",
        [M04_I18N_KEY.MAIL_PREMATURE_HINT_REPEL]: "有东西还在里面。你自己的日志会点出它。",

        [M04_I18N_KEY.MAIL_REPORT_SUBJECT]: "烧毁通知 — 是谁在找",
        [M04_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT]: ["追踪者：{{hunter}}", "已控制：{{contained}}"].join("\n"),
        [M04_I18N_KEY.MAIL_REPORT_BODY]: ["追踪者：{{hunter}}", "已控制：{{contained}}"].join("\n"),

        [M04_I18N_KEY.BANNER_LABEL]: "有连接进入",
        [M04_I18N_KEY.BANNER_CRITICAL]: "追踪即将完成",
        [M04_I18N_KEY.BANNER_DETAIL]: "防火墙上有未授权会话。你自己的日志会点出来源。",
        [M04_I18N_KEY.BANNER_SEVERED]: "连接已切断",
        [M04_I18N_KEY.BANNER_SEVERED_DETAIL]: "会话已切断。他们知道你注意到了。",
        [M04_I18N_KEY.BANNER_BREACHED]: "追踪已完成",
        [M04_I18N_KEY.BANNER_BREACHED_DETAIL]: "他们比你先做完。",
        [M04_I18N_KEY.TOAST_STRIKE]: "你自己的防火墙上有异常活动。",

        [M04_I18N_KEY.DEVICE_FIREWALL_LOG]: [
            "Sep 24 02:20:11 ghostwire kernel: [fw] ACCEPT out 443 mirror.update.pool",
            "Sep 24 02:23:48 ghostwire ntpd[641]: adjusting local clock by -0.183s",
            "Sep 24 02:31:02 ghostwire kernel: [fw] ACCEPT out 443 cdn-edge-14",
            "Sep 24 02:38:55 ghostwire kernel: [fw] DROP in 443 {{scannerA}} (handshake failed 1/6)",
            "Sep 24 02:39:01 ghostwire kernel: [fw] DROP in 443 {{scannerA}} (handshake failed 4/6)",
            "Sep 24 02:39:07 ghostwire kernel: [fw] DROP in 443 {{scannerA}} (handshake failed 6/6, source released)",
            "Sep 24 02:44:19 ghostwire kernel: [fw] DROP in 22 {{scannerB}} (no service)",
            "Sep 24 02:44:26 ghostwire kernel: [fw] DROP in 22 {{scannerB}} (no service, source released)",
            "Sep 24 02:51:33 ghostwire sshd[1182]: Did not receive identification string from {{scannerB}}",
            "Sep 24 02:58:40 ghostwire kernel: [fw] ACCEPT in 443 {{intruder}} (session established)",
            "Sep 24 02:58:41 ghostwire authd[903]: session {{intruder}} holds uid 0",
            "Sep 24 02:59:41 ghostwire kernel: [fw] ACCEPT out 443 {{intruder}} (beacon, interval {{interval}}s)",
            "Sep 24 03:00:41 ghostwire kernel: [fw] ACCEPT out 443 {{intruder}} (beacon, interval {{interval}}s)",
            "Sep 24 03:04:52 ghostwire kernel: [fw] ACCEPT out 443 mirror.update.pool",
        ].join("\n"),

        [M04_I18N_KEY.OSINT_WHOIS_CONTROL_CONTACT]: "防弹 VPN 有限公司",
    },
});
