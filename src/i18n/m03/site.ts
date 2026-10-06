import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M03_SITE_KEY = {
    TAGLINE: "M03.SITE.SK.TAGLINE",
    ABOUT_TITLE: "M03.SITE.SK.ABOUT_TITLE",
    ABOUT_BODY: "M03.SITE.SK.ABOUT_BODY",
    SERVICES_TITLE: "M03.SITE.SK.SERVICES_TITLE",
    SERVICES_BODY: "M03.SITE.SK.SERVICES_BODY",
    PEOPLE_TITLE: "M03.SITE.SK.PEOPLE_TITLE",
    DEPT_FINANCE: "M03.SITE.SK.DEPT_FINANCE",
    DEPT_OPERATIONS: "M03.SITE.SK.DEPT_OPERATIONS",
    ROLE_ANALYST: "M03.SITE.SK.ROLE_ANALYST",
    ACCESS_TITLE: "M03.SITE.SK.ACCESS_TITLE",
    ACCESS_REMOTE: "M03.SITE.SK.ACCESS_REMOTE",
    ACCESS_GATEWAY: "M03.SITE.SK.ACCESS_GATEWAY",
    CONTACT: "M03.SITE.SK.CONTACT",
    FOOTER: "M03.SITE.SK.FOOTER",
} as const;

Localization.registerAll({
    en: {
        [M03_SITE_KEY.TAGLINE]:
            "logistics, freight forwarding, trade consulting. trading as <strong>Skynet</strong>.",
        [M03_SITE_KEY.ABOUT_TITLE]: "About",
        [M03_SITE_KEY.ABOUT_BODY]: "family-owned since paperwork says so. regional and international reach.",
        [M03_SITE_KEY.SERVICES_TITLE]: "Services",
        [M03_SITE_KEY.SERVICES_BODY]: "customs brokerage · warehousing · \"consulting fees\"",
        [M03_SITE_KEY.PEOPLE_TITLE]: "Our People",
        [M03_SITE_KEY.DEPT_FINANCE]: "Finance —",
        [M03_SITE_KEY.DEPT_OPERATIONS]: "Operations —",
        [M03_SITE_KEY.ROLE_ANALYST]: "analyst",
        [M03_SITE_KEY.ACCESS_TITLE]: "Staff Access",
        [M03_SITE_KEY.ACCESS_REMOTE]:
            "employees working remotely: sign in through remote.skynet-importexport.biz",
        [M03_SITE_KEY.ACCESS_GATEWAY]:
            "the gateway forwards nothing to the finance VLAN until IT adds a rule. hosts on the request form: Coin-Drift (database 3306, share 445, ledger portal ledger.skynet-importexport.biz), Faded-Ledger (ssh 22, share 445), Split-Bill (share 445), Vault-Line (tunnel gateway, RDP 3389).",
        [M03_SITE_KEY.CONTACT]: "for partnership inquiries, contact our finance department.",
        [M03_SITE_KEY.FOOTER]:
            "© Skynet Import-Export Co. · corporate IT security policy in force since 2024 · annual password rotation (currently suspended pending audit).",
    },
    zh: {
        [M03_SITE_KEY.TAGLINE]: "物流、货运代理、贸易咨询。以 <strong>Skynet</strong> 之名经营。",
        [M03_SITE_KEY.ABOUT_TITLE]: "关于我们",
        [M03_SITE_KEY.ABOUT_BODY]: "家族企业——至少文件上是这么写的。业务覆盖区域与国际。",
        [M03_SITE_KEY.SERVICES_TITLE]: "服务",
        [M03_SITE_KEY.SERVICES_BODY]: "报关经纪 · 仓储 · “咨询费”",
        [M03_SITE_KEY.PEOPLE_TITLE]: "我们的人",
        [M03_SITE_KEY.DEPT_FINANCE]: "财务 —",
        [M03_SITE_KEY.DEPT_OPERATIONS]: "运营 —",
        [M03_SITE_KEY.ROLE_ANALYST]: "分析师",
        [M03_SITE_KEY.ACCESS_TITLE]: "员工接入",
        [M03_SITE_KEY.ACCESS_REMOTE]: "远程办公的员工：请通过 remote.skynet-importexport.biz 登录",
        [M03_SITE_KEY.ACCESS_GATEWAY]:
            "在 IT 添加规则之前，网关不会向财务 VLAN 转发任何东西。申请表上的主机：Coin-Drift（数据库 3306、共享 445、账本门户 ledger.skynet-importexport.biz），Faded-Ledger（ssh 22、共享 445），Split-Bill（共享 445），Vault-Line（隧道网关、RDP 3389）。",
        [M03_SITE_KEY.CONTACT]: "合作咨询，请联系我们的财务部门。",
        [M03_SITE_KEY.FOOTER]:
            "© Skynet Import-Export Co. · 公司 IT 安全政策自 2024 年起生效 · 密码每年轮换（目前因审计暂停）。",
    },
});
