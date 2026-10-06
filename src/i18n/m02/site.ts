import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M02_SITE_KEY = {
    TR_TAGLINE: "M02.SITE.TR.TAGLINE",
    TR_PAYLOAD_TITLE: "M02.SITE.TR.PAYLOAD_TITLE",
    TR_PAYLOAD_BODY: "M02.SITE.TR.PAYLOAD_BODY",
    TR_UPTIME_TITLE: "M02.SITE.TR.UPTIME_TITLE",
    TR_UPTIME_BODY: "M02.SITE.TR.UPTIME_BODY",
    TR_FOOTER: "M02.SITE.TR.FOOTER",
    TR_ADMIN_HEADING: "M02.SITE.TR.ADMIN_HEADING",
    TR_ADMIN_TAGLINE: "M02.SITE.TR.ADMIN_TAGLINE",
    TR_ADMIN_USERNAME: "M02.SITE.TR.ADMIN_USERNAME",
    TR_ADMIN_PASSWORD: "M02.SITE.TR.ADMIN_PASSWORD",
} as const;

Localization.registerAll({
    en: {
        [M02_SITE_KEY.TR_TAGLINE]: "toolkit dev. builds things that aren't supposed to exist.",
        [M02_SITE_KEY.TR_PAYLOAD_TITLE]: "payload_v9 shipped",
        [M02_SITE_KEY.TR_PAYLOAD_BODY]: "faster encryption, cleaner C2 handshake. clients happy.",
        [M02_SITE_KEY.TR_UPTIME_TITLE]: "uptime notice",
        [M02_SITE_KEY.TR_UPTIME_BODY]: "devbox may be flaky this week, migrating some services.",
        [M02_SITE_KEY.TR_FOOTER]: "no contact form. you know how to find me if you need to.",
        [M02_SITE_KEY.TR_ADMIN_HEADING]: "Admin Login",
        [M02_SITE_KEY.TR_ADMIN_TAGLINE]: "restricted. nothing interesting here — the real panel isn't on this box.",
        [M02_SITE_KEY.TR_ADMIN_USERNAME]: "username",
        [M02_SITE_KEY.TR_ADMIN_PASSWORD]: "password",
    },
    zh: {
        [M02_SITE_KEY.TR_TAGLINE]: "工具包开发者。专造那些本不该存在的东西。",
        [M02_SITE_KEY.TR_PAYLOAD_TITLE]: "payload_v9 已发布",
        [M02_SITE_KEY.TR_PAYLOAD_BODY]: "加密更快，C2 握手更干净。客户都很满意。",
        [M02_SITE_KEY.TR_UPTIME_TITLE]: "运行状态通知",
        [M02_SITE_KEY.TR_UPTIME_BODY]: "本周开发机可能不太稳定，正在迁移部分服务。",
        [M02_SITE_KEY.TR_FOOTER]: "没有联系表单。需要的话，你知道怎么找到我。",
        [M02_SITE_KEY.TR_ADMIN_HEADING]: "管理员登录",
        [M02_SITE_KEY.TR_ADMIN_TAGLINE]: "仅限授权人员。这里没什么有意思的东西——真正的面板不在这台机器上。",
        [M02_SITE_KEY.TR_ADMIN_USERNAME]: "用户名",
        [M02_SITE_KEY.TR_ADMIN_PASSWORD]: "密码",
    },
});
