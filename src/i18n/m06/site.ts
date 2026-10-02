import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M06_SITE_KEY = {
    REGISTRY_BRAND: "M06.SITE.REGISTRY.BRAND",
    REGISTRY_TAGLINE: "M06.SITE.REGISTRY.TAGLINE",
    REGISTRY_NAV_HOME: "M06.SITE.REGISTRY.NAV_HOME",
    REGISTRY_HOME_TITLE: "M06.SITE.REGISTRY.HOME_TITLE",
    REGISTRY_HOME_INTRO: "M06.SITE.REGISTRY.HOME_INTRO",
    REGISTRY_COL_ENTITY: "M06.SITE.REGISTRY.COL_ENTITY",
    REGISTRY_COL_NUMBER: "M06.SITE.REGISTRY.COL_NUMBER",
    REGISTRY_COL_STATUS: "M06.SITE.REGISTRY.COL_STATUS",
    REGISTRY_STATUS_ACTIVE: "M06.SITE.REGISTRY.STATUS_ACTIVE",
    REGISTRY_SECTION_INDEX: "M06.SITE.REGISTRY.SECTION_INDEX",
    REGISTRY_FOOTER: "M06.SITE.REGISTRY.FOOTER",

    ENTITY_TITLE: "M06.SITE.ENTITY.TITLE",
    ENTITY_LABEL_NUMBER: "M06.SITE.ENTITY.LABEL_NUMBER",
    ENTITY_LABEL_INCORPORATED: "M06.SITE.ENTITY.LABEL_INCORPORATED",
    ENTITY_LABEL_JURISDICTION: "M06.SITE.ENTITY.LABEL_JURISDICTION",
    ENTITY_LABEL_AGENT: "M06.SITE.ENTITY.LABEL_AGENT",
    ENTITY_LABEL_STATUS: "M06.SITE.ENTITY.LABEL_STATUS",
    ENTITY_SECTION_PARTICULARS: "M06.SITE.ENTITY.SECTION_PARTICULARS",
    ENTITY_NOTE: "M06.SITE.ENTITY.NOTE",

    FILINGS_TITLE: "M06.SITE.FILINGS.TITLE",
    FILINGS_INTRO: "M06.SITE.FILINGS.INTRO",
    FILINGS_COL_YEAR: "M06.SITE.FILINGS.COL_YEAR",
    FILINGS_COL_SUBJECT: "M06.SITE.FILINGS.COL_SUBJECT",
    FILINGS_COL_STATE: "M06.SITE.FILINGS.COL_STATE",
    FILINGS_EMPTY: "M06.SITE.FILINGS.EMPTY",
    FILINGS_NOTICE: "M06.SITE.FILINGS.NOTICE",
} as const;

Localization.registerAll({
    en: {
        [M06_SITE_KEY.REGISTRY_BRAND]: "Port Calder Companies Registry",
        [M06_SITE_KEY.REGISTRY_TAGLINE]: "Statutory register of companies and officers",
        [M06_SITE_KEY.REGISTRY_NAV_HOME]: "Register index",
        [M06_SITE_KEY.REGISTRY_HOME_TITLE]: "Search the register",
        [M06_SITE_KEY.REGISTRY_HOME_INTRO]:
            "Entries are published as filed. The registry does not verify the particulars supplied by an entity or its agent.",
        [M06_SITE_KEY.REGISTRY_COL_ENTITY]: "Entity",
        [M06_SITE_KEY.REGISTRY_COL_NUMBER]: "Number",
        [M06_SITE_KEY.REGISTRY_COL_STATUS]: "Status",
        [M06_SITE_KEY.REGISTRY_STATUS_ACTIVE]: "Active",
        [M06_SITE_KEY.REGISTRY_SECTION_INDEX]: "Recently filed",
        [M06_SITE_KEY.REGISTRY_FOOTER]: "Port Calder Companies Registry — statutory publication",

        [M06_SITE_KEY.ENTITY_TITLE]: "SKN Capital Nominees Ltd",
        [M06_SITE_KEY.ENTITY_LABEL_NUMBER]: "Company number",
        [M06_SITE_KEY.ENTITY_LABEL_INCORPORATED]: "Incorporated",
        [M06_SITE_KEY.ENTITY_LABEL_JURISDICTION]: "Jurisdiction",
        [M06_SITE_KEY.ENTITY_LABEL_AGENT]: "Registered agent",
        [M06_SITE_KEY.ENTITY_LABEL_STATUS]: "Status",
        [M06_SITE_KEY.ENTITY_SECTION_PARTICULARS]: "Particulars as filed",
        [M06_SITE_KEY.ENTITY_NOTE]:
            "Officers and shareholdings are published only where the entity has filed them. Historic filings are retained.",

        [M06_SITE_KEY.FILINGS_TITLE]: "Filing archive",
        [M06_SITE_KEY.FILINGS_INTRO]:
            "Superseded filings are retained for public inspection. A later filing does not remove an earlier one.",
        [M06_SITE_KEY.FILINGS_COL_YEAR]: "Filed",
        [M06_SITE_KEY.FILINGS_COL_SUBJECT]: "Subject",
        [M06_SITE_KEY.FILINGS_COL_STATE]: "State",
        [M06_SITE_KEY.FILINGS_EMPTY]: "No superseded filings are published for this entity.",
        [M06_SITE_KEY.FILINGS_NOTICE]: "This page is not linked from the register index.",
    },
    zh: {
        [M06_SITE_KEY.REGISTRY_BRAND]: "Port Calder 公司登记处",
        [M06_SITE_KEY.REGISTRY_TAGLINE]: "公司与高管的法定登记册",
        [M06_SITE_KEY.REGISTRY_NAV_HOME]: "登记册索引",
        [M06_SITE_KEY.REGISTRY_HOME_TITLE]: "检索登记册",
        [M06_SITE_KEY.REGISTRY_HOME_INTRO]:
            "条目按备案原样公布。登记处不核验实体或其代理人所提交的具体事项。",
        [M06_SITE_KEY.REGISTRY_COL_ENTITY]: "实体",
        [M06_SITE_KEY.REGISTRY_COL_NUMBER]: "编号",
        [M06_SITE_KEY.REGISTRY_COL_STATUS]: "状态",
        [M06_SITE_KEY.REGISTRY_STATUS_ACTIVE]: "存续",
        [M06_SITE_KEY.REGISTRY_SECTION_INDEX]: "近期备案",
        [M06_SITE_KEY.REGISTRY_FOOTER]: "Port Calder 公司登记处 — 法定公告",

        [M06_SITE_KEY.ENTITY_TITLE]: "SKN Capital Nominees Ltd",
        [M06_SITE_KEY.ENTITY_LABEL_NUMBER]: "公司编号",
        [M06_SITE_KEY.ENTITY_LABEL_INCORPORATED]: "成立日期",
        [M06_SITE_KEY.ENTITY_LABEL_JURISDICTION]: "司法管辖区",
        [M06_SITE_KEY.ENTITY_LABEL_AGENT]: "注册代理人",
        [M06_SITE_KEY.ENTITY_LABEL_STATUS]: "状态",
        [M06_SITE_KEY.ENTITY_SECTION_PARTICULARS]: "备案所载事项",
        [M06_SITE_KEY.ENTITY_NOTE]: "高管与持股情况仅在实体已备案时公布。历史备案一并留存。",

        [M06_SITE_KEY.FILINGS_TITLE]: "备案档案",
        [M06_SITE_KEY.FILINGS_INTRO]: "被取代的备案仍留存供公众查阅。后一份备案不会注销前一份。",
        [M06_SITE_KEY.FILINGS_COL_YEAR]: "备案时间",
        [M06_SITE_KEY.FILINGS_COL_SUBJECT]: "事项",
        [M06_SITE_KEY.FILINGS_COL_STATE]: "状态",
        [M06_SITE_KEY.FILINGS_EMPTY]: "本实体没有公布被取代的备案。",
        [M06_SITE_KEY.FILINGS_NOTICE]: "本页未从登记册索引链接。",
    },
});
