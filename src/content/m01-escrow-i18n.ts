import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M01_ESCROW_KEY = {
    BRAND_SUB: "M01.ESCROW.BRAND_SUB",
    PUBLIC_LABEL: "M01.ESCROW.PUBLIC_LABEL",
    KICKER: "M01.ESCROW.KICKER",
    TITLE: "M01.ESCROW.TITLE",
    DESCRIPTION: "M01.ESCROW.DESCRIPTION",
    META_LINE: "M01.ESCROW.META_LINE",

    TAB_ALL: "M01.ESCROW.TAB.ALL",
    TAB_HELD: "M01.ESCROW.TAB.HELD",
    TAB_RELEASED: "M01.ESCROW.TAB.RELEASED",
    TAB_PENDING: "M01.ESCROW.TAB.PENDING",
    SEARCH_PLACEHOLDER: "M01.ESCROW.SEARCH_PLACEHOLDER",

    STAT_VISIBLE: "M01.ESCROW.STAT.VISIBLE",
    STAT_HELD: "M01.ESCROW.STAT.HELD",
    STAT_RELEASED: "M01.ESCROW.STAT.RELEASED",
    STAT_PENDING: "M01.ESCROW.STAT.PENDING",

    COL_TIME: "M01.ESCROW.COL.TIME",
    COL_ESCROW_REF: "M01.ESCROW.COL.ESCROW_REF",
    COL_LISTING_REF: "M01.ESCROW.COL.LISTING_REF",
    COL_BUYER: "M01.ESCROW.COL.BUYER",
    COL_SELLER: "M01.ESCROW.COL.SELLER",
    COL_AMOUNT: "M01.ESCROW.COL.AMOUNT",
    COL_STATUS: "M01.ESCROW.COL.STATUS",

    PARTY_ANON_BUYER: "M01.ESCROW.PARTY.ANON_BUYER",
    PARTY_ANON_VENDOR: "M01.ESCROW.PARTY.ANON_VENDOR",

    STATUS_HELD: "M01.ESCROW.STATUS.HELD",
    STATUS_RELEASED: "M01.ESCROW.STATUS.RELEASED",
    STATUS_PENDING: "M01.ESCROW.STATUS.PENDING",
    STATUS_DISPUTED: "M01.ESCROW.STATUS.DISPUTED",

    PAGE_INFO_EMPTY: "M01.ESCROW.PAGE_INFO_EMPTY",
    PAGE_INFO_TEMPLATE: "M01.ESCROW.PAGE_INFO_TEMPLATE",

    NOTE_LEFT: "M01.ESCROW.NOTE_LEFT",
    NOTE_RIGHT: "M01.ESCROW.NOTE_RIGHT",
} as const;

Localization.registerAll({
    en: {
        [M01_ESCROW_KEY.BRAND_SUB]: "Independent Escrow Service",
        [M01_ESCROW_KEY.PUBLIC_LABEL]: "Public transaction board",
        [M01_ESCROW_KEY.KICKER]: "Settlement activity",
        [M01_ESCROW_KEY.TITLE]: "Transaction Board",
        [M01_ESCROW_KEY.DESCRIPTION]:
            "Public transaction references and settlement status. Amounts, personal and banking details are not displayed.",
        [M01_ESCROW_KEY.META_LINE]: "Last board update",

        [M01_ESCROW_KEY.TAB_ALL]: "All transactions",
        [M01_ESCROW_KEY.TAB_HELD]: "Funds held",
        [M01_ESCROW_KEY.TAB_RELEASED]: "Released",
        [M01_ESCROW_KEY.TAB_PENDING]: "Pending",
        [M01_ESCROW_KEY.SEARCH_PLACEHOLDER]: "Search reference...",

        [M01_ESCROW_KEY.STAT_VISIBLE]: "Visible transactions",
        [M01_ESCROW_KEY.STAT_HELD]: "Funds currently held",
        [M01_ESCROW_KEY.STAT_RELEASED]: "Released",
        [M01_ESCROW_KEY.STAT_PENDING]: "Pending",

        [M01_ESCROW_KEY.COL_TIME]: "Time",
        [M01_ESCROW_KEY.COL_ESCROW_REF]: "Escrow Ref",
        [M01_ESCROW_KEY.COL_LISTING_REF]: "Listing Ref",
        [M01_ESCROW_KEY.COL_BUYER]: "Buyer",
        [M01_ESCROW_KEY.COL_SELLER]: "Seller / Vendor",
        [M01_ESCROW_KEY.COL_AMOUNT]: "Amount",
        [M01_ESCROW_KEY.COL_STATUS]: "Status",

        [M01_ESCROW_KEY.PARTY_ANON_BUYER]: "anonymous buyer",
        [M01_ESCROW_KEY.PARTY_ANON_VENDOR]: "anonymous vendor",

        [M01_ESCROW_KEY.STATUS_HELD]: "Funds held",
        [M01_ESCROW_KEY.STATUS_RELEASED]: "Released",
        [M01_ESCROW_KEY.STATUS_PENDING]: "Pending",
        [M01_ESCROW_KEY.STATUS_DISPUTED]: "Disputed",

        [M01_ESCROW_KEY.PAGE_INFO_EMPTY]: "Showing 0 of 0",
        [M01_ESCROW_KEY.PAGE_INFO_TEMPLATE]: "Showing {{start}}–{{end}} of {{total}}",

        [M01_ESCROW_KEY.NOTE_LEFT]:
            "ClearEscrow operates as an independent third-party escrow service. All references shown are transaction metadata.",
        [M01_ESCROW_KEY.NOTE_RIGHT]: "Board refresh: automatic",
    },
    zh: {
        [M01_ESCROW_KEY.BRAND_SUB]: "独立托管服务",
        [M01_ESCROW_KEY.PUBLIC_LABEL]: "公开交易公告板",
        [M01_ESCROW_KEY.KICKER]: "结算活动",
        [M01_ESCROW_KEY.TITLE]: "交易公告板",
        [M01_ESCROW_KEY.DESCRIPTION]: "公开交易编号与结算状态。不显示金额、个人及银行信息。",
        [M01_ESCROW_KEY.META_LINE]: "最后更新",

        [M01_ESCROW_KEY.TAB_ALL]: "全部交易",
        [M01_ESCROW_KEY.TAB_HELD]: "托管中",
        [M01_ESCROW_KEY.TAB_RELEASED]: "已释放",
        [M01_ESCROW_KEY.TAB_PENDING]: "待处理",
        [M01_ESCROW_KEY.SEARCH_PLACEHOLDER]: "搜索编号...",

        [M01_ESCROW_KEY.STAT_VISIBLE]: "可见交易数",
        [M01_ESCROW_KEY.STAT_HELD]: "当前托管资金",
        [M01_ESCROW_KEY.STAT_RELEASED]: "已释放",
        [M01_ESCROW_KEY.STAT_PENDING]: "待处理",

        [M01_ESCROW_KEY.COL_TIME]: "时间",
        [M01_ESCROW_KEY.COL_ESCROW_REF]: "托管编号",
        [M01_ESCROW_KEY.COL_LISTING_REF]: "挂牌编号",
        [M01_ESCROW_KEY.COL_BUYER]: "买家",
        [M01_ESCROW_KEY.COL_SELLER]: "卖家 / 供应商",
        [M01_ESCROW_KEY.COL_AMOUNT]: "金额",
        [M01_ESCROW_KEY.COL_STATUS]: "状态",

        [M01_ESCROW_KEY.PARTY_ANON_BUYER]: "匿名买家",
        [M01_ESCROW_KEY.PARTY_ANON_VENDOR]: "匿名卖家",

        [M01_ESCROW_KEY.STATUS_HELD]: "托管中",
        [M01_ESCROW_KEY.STATUS_RELEASED]: "已释放",
        [M01_ESCROW_KEY.STATUS_PENDING]: "待处理",
        [M01_ESCROW_KEY.STATUS_DISPUTED]: "有争议",

        [M01_ESCROW_KEY.PAGE_INFO_EMPTY]: "显示 0 / 0 条",
        [M01_ESCROW_KEY.PAGE_INFO_TEMPLATE]: "显示第 {{start}}–{{end}} 条，共 {{total}} 条",

        [M01_ESCROW_KEY.NOTE_LEFT]: "ClearEscrow 为独立第三方托管服务。以上所有编号均为交易元数据。",
        [M01_ESCROW_KEY.NOTE_RIGHT]: "公告板刷新：自动",
    },
});
